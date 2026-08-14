import assert from 'node:assert/strict'
import { mkdtemp, mkdir, stat, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import gifenc from 'gifenc'
import { PNG } from 'pngjs'
import { chromium } from 'playwright'
import {
  chromiumArgs, findChromeForTesting, setRange, waitForOcean, watchPageErrors,
} from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { GIFEncoder, applyPalette, quantize } = gifenc
const output = resolve(root, 'docs/screenshots')
const extension = resolve(root, 'extension')
const harnessUrl = process.env.OSS_HARNESS_URL || 'http://127.0.0.1:3080'
const chrome = await findChromeForTesting(chromium.executablePath())
await mkdir(output, { recursive: true })

async function openSettings(page) {
  let dialog = page.getByRole('dialog', { name: /^(设置|Settings)$/ })
  if (!await dialog.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /^(设置|Settings)$/ }).click()
    dialog = page.getByRole('dialog', { name: /^(设置|Settings)$/ })
    await dialog.waitFor()
  }
  const title = dialog.getByText(/海洋皮肤|Open Sea Skin/, { exact: true })
  await title.waitFor()
  const section = title.locator('xpath=ancestor::section[1]')
  assert.equal(await section.locator('input[type="range"]').count(), 3, 'native settings must expose three ranges')
  return { dialog, section }
}

async function closeSettings(dialog) {
  await dialog.getByRole('button', { name: /关闭|Close/, exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
}

async function setSkin(section, { sea, time, glass }) {
  const ranges = section.locator('input[type="range"]')
  // Playwright's fill emits trusted events through React's controlled-input
  // value tracker; direct DOM assignment would be ignored by this UI.
  if (sea !== undefined) await ranges.nth(0).fill(String(sea))
  if (time !== undefined) await ranges.nth(1).fill(String(time))
  if (glass !== undefined) await ranges.nth(2).fill(String(glass))
  await section.page().waitForTimeout(180)
}

async function state(page) {
  const handle = await page.locator('#__open-sea-skin__').elementHandle()
  const frame = await handle?.contentFrame()
  assert.ok(frame, 'native background iframe must have a frame')
  return frame.evaluate(() => globalThis.__ossState())
}

async function rpc(page, method, payload) {
  const response = await page.evaluate(async ({ method, payload }) => {
    const rpcId = `open-sea-gallery-${Date.now()}-${Math.random()}`
    const result = await fetch(`/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: 'client-request', rpcId, method, payload }),
    })
    return result.json()
  }, { method, payload })
  assert.equal(response.result?.ok, true, JSON.stringify(response.result))
  return response.result.value
}

async function verifyHarnessChrome(page) {
  await page.setViewportSize({ width: 2048, height: 1024 })
  const quickButton = page.getByRole('button', { name: /皮肤设置|Skin settings/, exact: true })
  await quickButton.waitFor()
  await quickButton.click()
  const quickPanel = page.getByRole('dialog', { name: /皮肤设置|Skin settings/, exact: true })
  await quickPanel.waitFor()
  const quickRanges = quickPanel.locator('input[type="range"]')
  assert.equal(await quickRanges.count(), 3, 'sidebar skin settings must expose three ranges')
  await quickRanges.nth(0).fill('61')
  await quickRanges.nth(1).fill('12')
  await quickRanges.nth(2).fill('64')
  await page.waitForTimeout(220)
  let current = await state(page)
  assert.ok(Math.abs(current.sea - 1.165) < 0.03, JSON.stringify(current))
  assert.ok(Math.abs(current.daylight - 12) < 0.1, JSON.stringify(current))
  await page.screenshot({ path: resolve(output, 'harness-quick-controls.png') })
  await page.keyboard.press('Escape')
  await quickPanel.waitFor({ state: 'hidden' })

  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForOcean(page)
  const persisted = await openSettings(page)
  const persistedRanges = persisted.section.locator('input[type="range"]')
  assert.deepEqual(await persistedRanges.evaluateAll(inputs => inputs.map(input => Number(input.value))), [61, 12, 64])
  await closeSettings(persisted.dialog)

  await rpc(page, 'settings.update', { ns: 'ui-theme', patch: { preference: 'dark' } })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForOcean(page)
  const controls = await openSettings(page)
  const panelBox = await controls.dialog.boundingBox()
  const composerBox = await page.locator('textarea').first().boundingBox()
  assert.ok(panelBox && composerBox, 'settings panel and composer must have measurable boxes')
  const overlap = {
    left: Math.max(panelBox.x, composerBox.x),
    top: Math.max(panelBox.y, composerBox.y),
    right: Math.min(panelBox.x + panelBox.width, composerBox.x + composerBox.width),
    bottom: Math.min(panelBox.y + panelBox.height, composerBox.y + composerBox.height),
  }
  assert.ok(overlap.right - overlap.left > 20 && overlap.bottom - overlap.top > 20, 'wide viewport must reproduce the historic dialog/composer intersection')
  const dialogOwnsOverlap = await page.evaluate(({ x, y }) => {
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]')
    const top = document.elementFromPoint(x, y)
    return dialog instanceof HTMLElement && top instanceof Element && dialog.contains(top)
  }, { x: (overlap.left + overlap.right) / 2, y: (overlap.top + overlap.bottom) / 2 })
  assert.equal(dialogOwnsOverlap, true, 'settings dialog must paint above the conversation composer')
  await page.screenshot({ path: resolve(output, 'harness-settings-wide-dark.png') })
  await closeSettings(controls.dialog)
  await rpc(page, 'settings.update', { ns: 'ui-theme', patch: { preference: 'system' } })
}

async function captureHarness() {
  const browser = await chromium.launch({ executablePath: chrome, headless: false, args: chromiumArgs() })
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 })
  const failures = watchPageErrors(page, 'native Harness')
  try {
    await page.goto(harnessUrl, { waitUntil: 'domcontentloaded' })
    assert.equal(await page.title(), 'DeepSeek Harness')
    await waitForOcean(page)
    await verifyHarnessChrome(page)
    await page.setViewportSize({ width: 1440, height: 960 })

    let controls = await openSettings(page)
    await setSkin(controls.section, { sea: 52, time: 16, glass: 62 })
    let current = await state(page)
    assert.ok(Math.abs(current.sea - 1.03) < 0.03, JSON.stringify(current))
    assert.ok(Math.abs(current.daylight - 16) < 0.1, JSON.stringify(current))
    await page.screenshot({ path: resolve(output, 'harness-open-sea-overview.png') })
    await closeSettings(controls.dialog)

    controls = await openSettings(page)
    await setSkin(controls.section, { sea: 8, time: 64, glass: 62 })
    await closeSettings(controls.dialog)
    await page.waitForTimeout(350)
    await page.screenshot({ path: resolve(output, 'harness-calm-sea.png') })

    controls = await openSettings(page)
    await setSkin(controls.section, { sea: 42, time: 7, glass: 58 })
    await closeSettings(controls.dialog)
    await page.waitForTimeout(350)
    await page.screenshot({ path: resolve(output, 'harness-sunset.png') })

    controls = await openSettings(page)
    await setSkin(controls.section, { sea: 94, time: 46, glass: 62 })
    await closeSettings(controls.dialog)
    await page.waitForTimeout(350)
    await page.screenshot({ path: resolve(output, 'harness-high-sea.png') })

    await page.setViewportSize({ width: 960, height: 640 })
    controls = await openSettings(page)
    const frames = []
    const sequence = [
      { sea: 24, time: 58 }, { sea: 30, time: 48 }, { sea: 36, time: 38 },
      { sea: 42, time: 28 }, { sea: 48, time: 18 }, { sea: 54, time: 10 },
      { sea: 62, time: 7 }, { sea: 72, time: 7 }, { sea: 84, time: 7 },
      { sea: 94, time: 7 }, { sea: 94, time: 16 }, { sea: 84, time: 26 },
      { sea: 72, time: 36 }, { sea: 60, time: 46 }, { sea: 48, time: 56 },
      { sea: 36, time: 64 }, { sea: 28, time: 58 }, { sea: 24, time: 58 },
    ]
    for (const values of sequence) {
      await setSkin(controls.section, values)
      frames.push(await page.screenshot())
    }
    const gif = GIFEncoder()
    for (const [index, frame] of frames.entries()) {
      const image = PNG.sync.read(frame)
      const palette = quantize(image.data, 128, { format: 'rgb444' })
      const indexed = applyPalette(image.data, palette, 'rgb444')
      gif.writeFrame(indexed, image.width, image.height, {
        palette,
        delay: index === frames.length - 1 ? 700 : 130,
        repeat: 0,
      })
    }
    gif.finish()
    await writeFile(resolve(output, 'open-sea-controls.gif'), gif.bytes())

    await setSkin(controls.section, { sea: 45, time: 55, glass: 72 })
    assert.deepEqual(failures, [])
  } finally {
    await browser.close()
  }
}

async function captureNewTab() {
  const profile = await mkdtemp(resolve(tmpdir(), 'open-sea-gallery-extension-'))
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: chrome,
    headless: false,
    viewport: { width: 1440, height: 960 },
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      ...chromiumArgs(),
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
  })
  try {
    const page = context.pages()[0] ?? await context.newPage()
    const failures = watchPageErrors(page, 'extension new tab')
    await page.goto('chrome://newtab/')
    await page.locator('body.ready').waitFor({ timeout: 45_000 })
    await page.locator('canvas').waitFor({ state: 'visible' })
    await setRange(page.locator('#sea-state'), 58)
    await setRange(page.locator('#time-of-day'), 17)
    await page.waitForTimeout(350)
    await page.screenshot({ path: resolve(output, 'extension-new-tab.png') })
    assert.deepEqual(failures, [])
  } finally {
    await context.close()
    await rm(profile, { recursive: true, force: true })
  }
}

console.log(`Chrome for Testing: ${chrome}`)
console.log(`Harness: ${harnessUrl}`)
await captureHarness()
await captureNewTab()
for (const name of [
  'harness-settings-wide-dark.png', 'harness-quick-controls.png',
  'harness-open-sea-overview.png', 'harness-calm-sea.png', 'harness-sunset.png',
  'harness-high-sea.png', 'extension-new-tab.png', 'open-sea-controls.gif',
]) {
  const details = await stat(resolve(output, name))
  assert.ok(details.size > 50_000, `${name} is unexpectedly small`)
  console.log(`✓ ${name} (${(details.size / 1_048_576).toFixed(2)} MiB)`)
}
