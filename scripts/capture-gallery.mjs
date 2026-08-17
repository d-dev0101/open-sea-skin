import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtemp, mkdir, stat, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import {
  chromiumArgs, findChromeForTesting, waitForOcean, watchPageErrors,
} from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'docs/screenshots')
const harnessUrl = process.env.OSS_HARNESS_URL || 'http://127.0.0.1:3080'
const chrome = await findChromeForTesting(chromium.executablePath())
await mkdir(output, { recursive: true })

const BASELINE = Object.freeze({ sea: 56, time: 55, glass: 40 })
const GIF_VIEWPORT = Object.freeze({ width: 1440, height: 900 })
const GIF_WIDTH = 1200
const GIF_FPS = 8

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

async function openQuickControls(page) {
  const button = page.getByRole('button', { name: /皮肤设置|Skin settings/, exact: true })
  await button.waitFor()
  await button.click()
  const panel = page.getByRole('dialog', { name: /皮肤设置|Skin settings/, exact: true })
  await panel.waitFor()
  assert.equal(await panel.locator('input[type="range"]').count(), 3, 'quick controls must expose three ranges')
  return panel
}

async function setQuickSkin(page, panel, { sea, time, glass }) {
  const ranges = panel.locator('input[type="range"]')
  if (sea !== undefined) await ranges.nth(0).fill(String(sea))
  if (time !== undefined) await ranges.nth(1).fill(String(time))
  if (glass !== undefined) await ranges.nth(2).fill(String(glass))
  await page.waitForTimeout(70)
}

function interpolate(from, to, count) {
  return Array.from({ length: count }, (_, index) => (
    Math.round(from + (to - from) * (index / Math.max(1, count - 1)))
  ))
}

async function captureGif(page, name, steps, applyStep) {
  const frames = await mkdtemp(resolve(tmpdir(), `open-sea-${name.replace(/\.gif$/, '')}-`))
  try {
    for (const [index, step] of steps.entries()) {
      await applyStep(step, index)
      await page.waitForTimeout(55)
      const frame = `frame-${String(index).padStart(3, '0')}.png`
      await page.screenshot({ path: resolve(frames, frame) })
    }

    const filter = [
      `fps=${GIF_FPS},scale=${GIF_WIDTH}:-2:flags=lanczos,split[gif_base][palette_source]`,
      '[palette_source]palettegen=max_colors=128:stats_mode=diff[palette]',
      '[gif_base][palette]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
    ].join(';')
    const encoded = spawnSync('ffmpeg', [
      '-y', '-hide_banner', '-loglevel', 'error',
      '-framerate', String(GIF_FPS),
      '-i', resolve(frames, 'frame-%03d.png'),
      '-vf', filter,
      '-loop', '0',
      resolve(output, name),
    ], { encoding: 'utf8' })
    assert.equal(encoded.status, 0, `ffmpeg failed for ${name}:\n${encoded.stderr}`)
  } finally {
    await rm(frames, { recursive: true, force: true })
  }
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

async function applyBaselineSettings(page) {
  await rpc(page, 'settings.update', {
    ns: 'ui-open-sea-skin',
    patch: { enabled: true, ...BASELINE, autoCycle: false, quality: 'auto' },
  })
}

async function verifyHarnessChrome(page) {
  await page.setViewportSize({ width: 2048, height: 1024 })
  await applyBaselineSettings(page)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForOcean(page)
  const quickButton = page.getByRole('button', { name: /皮肤设置|Skin settings/, exact: true })
  await quickButton.waitFor()
  await quickButton.click()
  const quickPanel = page.getByRole('dialog', { name: /皮肤设置|Skin settings/, exact: true })
  await quickPanel.waitFor()
  const quickRanges = quickPanel.locator('input[type="range"]')
  assert.equal(await quickRanges.count(), 3, 'sidebar skin settings must expose three ranges')
  await quickRanges.nth(0).fill(String(BASELINE.sea))
  await quickRanges.nth(1).fill(String(BASELINE.time))
  await quickRanges.nth(2).fill(String(BASELINE.glass))
  await page.waitForTimeout(220)
  let current = await state(page)
  assert.ok(Math.abs(current.sea - 1.09) < 0.03, JSON.stringify(current))
  assert.ok(Math.abs(current.daylight - BASELINE.time) < 0.1, JSON.stringify(current))
  assert.equal(current.manualTimeOfDay, true, JSON.stringify(current))
  await page.keyboard.press('Escape')
  await quickPanel.waitFor({ state: 'hidden' })

  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForOcean(page)
  const persisted = await openSettings(page)
  const persistedRanges = persisted.section.locator('input[type="range"]')
  assert.deepEqual(
    await persistedRanges.evaluateAll(inputs => inputs.map(input => Number(input.value))),
    [BASELINE.sea, BASELINE.time, BASELINE.glass],
  )
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
  await closeSettings(controls.dialog)
  await rpc(page, 'settings.update', { ns: 'ui-theme', patch: { preference: 'system' } })
}

async function prepareGalleryPanel(page, preference) {
  await applyBaselineSettings(page)
  await rpc(page, 'settings.update', { ns: 'ui-theme', patch: { preference } })
  await page.setViewportSize(GIF_VIEWPORT)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForOcean(page)
  const panel = await openQuickControls(page)
  await setQuickSkin(page, panel, BASELINE)
  await page.waitForTimeout(400)
  return panel
}

async function captureHarness() {
  const browser = await chromium.launch({ executablePath: chrome, headless: false, args: chromiumArgs() })
  const page = await browser.newPage({ viewport: GIF_VIEWPORT, deviceScaleFactor: 1 })
  const failures = watchPageErrors(page, 'native Harness')
  try {
    await page.goto(harnessUrl, { waitUntil: 'domcontentloaded' })
    assert.equal(await page.title(), 'DeepSeek Harness')
    await waitForOcean(page)
    await verifyHarnessChrome(page)

    let panel = await prepareGalleryPanel(page, 'dark')
    await captureGif(page, 'harness-dark-overview.gif', Array.from({ length: 28 }), async () => {})
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })

    panel = await prepareGalleryPanel(page, 'light')
    await captureGif(page, 'harness-light-overview.gif', Array.from({ length: 28 }), async () => {})
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })

    panel = await prepareGalleryPanel(page, 'dark')
    const waveSequence = [
      ...Array(3).fill(BASELINE.sea),
      ...interpolate(BASELINE.sea, 16, 7).slice(1),
      ...interpolate(16, 92, 14).slice(1),
      ...interpolate(92, BASELINE.sea, 8).slice(1),
      ...Array(4).fill(BASELINE.sea),
    ]
    await captureGif(page, 'harness-wave-control.gif', waveSequence, async sea => {
      await setQuickSkin(page, panel, { sea })
    })
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })

    panel = await prepareGalleryPanel(page, 'dark')
    const daylightSequence = [
      ...Array(4).fill(70),
      ...interpolate(70, 7, 22).slice(1),
      ...Array(5).fill(7),
    ]
    await captureGif(page, 'harness-daylight-sunset.gif', daylightSequence, async time => {
      await setQuickSkin(page, panel, { time })
    })

    await setQuickSkin(page, panel, BASELINE)
    await page.keyboard.press('Escape')
    await panel.waitFor({ state: 'hidden' })
    await rpc(page, 'settings.update', {
      ns: 'ui-open-sea-skin',
      patch: { enabled: true, sea: 45, time: 55, glass: 72, autoCycle: true, quality: 'auto' },
    })
    await rpc(page, 'settings.update', { ns: 'ui-theme', patch: { preference: 'system' } })
    assert.deepEqual(failures, [])
  } finally {
    await browser.close()
  }
}

console.log(`Chrome for Testing: ${chrome}`)
console.log(`Harness: ${harnessUrl}`)
await captureHarness()
for (const name of [
  'harness-dark-overview.gif', 'harness-light-overview.gif',
  'harness-wave-control.gif', 'harness-daylight-sunset.gif',
]) {
  const details = await stat(resolve(output, name))
  assert.ok(details.size > 50_000, `${name} is unexpectedly small`)
  assert.ok(details.size < 15_000_000, `${name} is too large for a practical README (${details.size} bytes)`)
  console.log(`✓ ${name} (${(details.size / 1_048_576).toFixed(2)} MiB)`)
}
