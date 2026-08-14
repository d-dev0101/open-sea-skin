import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { chromium } from 'playwright'
import {
  chromiumArgs, findChromeForTesting, serveDirectory, setRange, waitForOcean, watchPageErrors,
} from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const extension = resolve(root, 'extension')
const fixture = resolve(root, 'tests/fixtures/harness')
const chrome = await findChromeForTesting(chromium.executablePath())
const headless = process.env.OSS_HEADLESS === '1'

async function extensionAcceptance() {
  const server = await serveDirectory(fixture)
  const profile = await mkdtemp(resolve(tmpdir(), 'open-sea-extension-profile-'))
  const context = await chromium.launchPersistentContext(profile, {
    executablePath: chrome,
    headless,
    viewport: { width: 1280, height: 800 },
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      ...chromiumArgs(),
      `--disable-extensions-except=${extension}`,
      `--load-extension=${extension}`,
    ],
  })
  try {
    const page = context.pages()[0] ?? await context.newPage()
    const failures = watchPageErrors(page, 'extension')
    await page.goto(server.url, { waitUntil: 'domcontentloaded' })
    const ocean = await waitForOcean(page)
    assert.equal(await page.locator('#__open-sea-skin__').count(), 1)
    assert.equal(await page.locator('#__open-sea-skin-btn__').count(), 1)

    await page.locator('#__open-sea-skin-btn__').click()
    const panel = page.locator('#__open-sea-skin-panel__.open')
    await panel.waitFor()
    await setRange(page.locator('#__open-sea-skin-panel__-sea-range'), 82)
    await setRange(page.locator('#__open-sea-skin-panel__-time-range'), 18)
    await setRange(page.locator('#__open-sea-skin-panel__-glass-range'), 65)
    await page.waitForTimeout(250)
    const state = await ocean.locator('body').evaluate(() => globalThis.__ossState())
    assert.ok(Math.abs(state.sea - 1.48) < 0.02, JSON.stringify(state))
    assert.ok(Math.abs(state.daylight - 18) < 0.02, JSON.stringify(state))
    assert.equal(state.manualTimeOfDay, true)
    assert.match(await page.locator('#__open-sea-skin-glass__').textContent(), /rgba\(255, 255, 255, 0\.65\)/)

    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForOcean(page)
    await page.locator('#__open-sea-skin-btn__').click()
    assert.equal(await page.locator('#__open-sea-skin-panel__-sea-range').inputValue(), '82')
    assert.equal(await page.locator('#__open-sea-skin-panel__-time-range').inputValue(), '18')
    assert.equal(await page.locator('#__open-sea-skin-panel__-glass-range').inputValue(), '65')

    const newTab = await context.newPage()
    const newTabFailures = watchPageErrors(newTab, 'new-tab')
    await newTab.goto('chrome://newtab/')
    await newTab.locator('body.ready').waitFor({ timeout: 45_000 })
    await newTab.locator('canvas').waitFor({ state: 'visible' })
    assert.equal(await newTab.locator('#sea-state').inputValue(), '45')
    assert.match(new URL(newTab.url()).protocol, /^chrome-extension:$/)
    await newTab.close()

    assert.deepEqual([...failures, ...newTabFailures], [])
  } finally {
    await context.close()
    await server.close()
    await rm(profile, { recursive: true, force: true })
  }
}

async function staticDistAcceptance() {
  const temp = await mkdtemp(resolve(tmpdir(), 'open-sea-dist-acceptance-'))
  const dist = resolve(temp, 'dist')
  await cp(fixture, dist, { recursive: true })
  const install = spawnSync('bash', [resolve(root, 'native-dist/install-skin.sh'), '--dist', dist], {
    cwd: root, encoding: 'utf8',
  })
  assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`)
  const server = await serveDirectory(dist)
  const browser = await chromium.launch({
    executablePath: chrome,
    headless,
    args: chromiumArgs(),
  })
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
    const failures = watchPageErrors(page, 'native-dist')
    await page.goto(server.url, { waitUntil: 'domcontentloaded' })
    const ocean = await waitForOcean(page)
    assert.equal(await page.locator('#__open-sea-skin__').count(), 1)
    await page.locator('#__open-sea-skin-btn__').click()
    await setRange(page.locator('#__open-sea-skin-panel__-sea-range'), 24)
    await setRange(page.locator('#__open-sea-skin-panel__-time-range'), 72)
    await page.waitForTimeout(200)
    const state = await ocean.locator('body').evaluate(() => globalThis.__ossState())
    assert.ok(Math.abs(state.sea - 0.61) < 0.02, JSON.stringify(state))
    assert.ok(Math.abs(state.daylight - 72) < 0.02, JSON.stringify(state))
    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForOcean(page)
    await page.locator('#__open-sea-skin-btn__').click()
    assert.equal(await page.locator('#__open-sea-skin-panel__-sea-range').inputValue(), '24')
    assert.equal(await page.locator('#__open-sea-skin-panel__-time-range').inputValue(), '72')
    assert.deepEqual(failures, [])
  } finally {
    await browser.close()
    await server.close()
  }

  const uninstall = spawnSync('bash', [resolve(root, 'native-dist/install-skin.sh'), '--uninstall', '--dist', dist], {
    cwd: root, encoding: 'utf8',
  })
  assert.equal(uninstall.status, 0, `${uninstall.stdout}\n${uninstall.stderr}`)
  assert.doesNotMatch(await readFile(resolve(dist, 'index.html'), 'utf8'), /open-sea-skin/)
  await rm(temp, { recursive: true, force: true })
}

console.log(`Chrome for Testing: ${chrome}`)
await extensionAcceptance()
console.log('✓ Extension new tab, Harness injection, live controls and persistence')
await staticDistAcceptance()
console.log('✓ Static Harness install, live controls, persistence and uninstall')
