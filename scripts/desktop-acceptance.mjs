import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { chromiumArgs, findChromeForTesting, serveDirectory, setRange, waitForOcean, watchPageErrors } from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await serveDirectory(root)
const browser = await chromium.launch({
  executablePath: await findChromeForTesting(chromium.executablePath()),
  headless: process.env.OSS_HEADLESS === '1', args: chromiumArgs(),
})
const baseline = process.env.OSS_DESKTOP_BASELINE === '1'
const output = resolve(root, 'output/playwright')
await mkdir(output, { recursive: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const failures = watchPageErrors(page, 'desktop')
  await page.route('**/open-sea-skin/**', async route => {
    const url = new URL(route.request().url())
    const response = await route.fetch({ url: `${server.url}/extension/${url.pathname.split('/open-sea-skin/')[1]}${url.search}` })
    await route.fulfill({ response })
  })
  await page.goto(`${server.url}/tests/fixtures/desktop/index.html`)
  await page.evaluate(() => {
    localStorage.setItem('ossAutoCycle', 'false')
    localStorage.setItem('ossGlass', '40')
    window.__ModuleLoader__ = { load({ factory }) {
      const plugin = factory(() => {})
      plugin.apply({ effect(fn) { window.stopOpenSea = fn() } })
    } }
  })
  if (baseline) await page.addScriptTag({ content: execFileSync('git', ['show', 'v1.2.2:plugin/client.js'], { cwd: root, encoding: 'utf8' }) })
  else await page.addScriptTag({ path: resolve(root, 'plugin/client.js') })
  await waitForOcean(page)
  // The renderer fades its loading veil after marking the canvas ready.
  await page.waitForTimeout(1200)
  await page.screenshot({ path: resolve(output, baseline ? 'desktop-before.png' : 'desktop-dark-40.png') })
  await page.locator('#__open-sea-skin-btn__').click()
  let cases = 0
  for (const mode of ['advanced', 'extended']) {
    for (const material of ['transparent', 'off']) {
      for (const dark of [true, false]) {
        for (const glass of [40, 65, 90]) {
          await page.evaluate(({ mode, material, dark }) => {
            document.body.dataset.dshDesktopMode = mode
            document.body.dataset.dshDesktopMaterial = material
            document.body.toggleAttribute('data-ds-dark-theme', dark)
          }, { mode, material, dark })
          await setRange(page.locator('#__open-sea-skin-panel__-glass-range'), glass)
          const paints = await page.evaluate(() => {
            const color = el => getComputedStyle(el).backgroundColor
            const alpha = el => {
              const rgba = color(el).match(/[\d.]+/g).map(Number)
              return rgba.length === 4 ? rgba[3] : 1
            }
            const effective = selector => {
              let total = 0
              for (let el = document.querySelector(selector); el && el !== document.body; el = el.parentElement) {
                total = 1 - (1 - total) * (1 - alpha(el))
              }
              return total
            }
            return {
              columns: ['.sidebarRoot', '.conversationRoot', '.detailsRoot'].map(effective),
              composer: alpha(document.querySelector('.composer')),
              dialog: alpha(document.querySelector('dialog')),
            }
          })
          const expected = dark ? Math.max(.4, glass / 100 - .12) : glass / 100
          for (const value of paints.columns) assert.ok(Math.abs(value - expected) < .005,
            `${mode}/${material}/${dark ? 'dark' : 'light'}/${glass}: columns ${JSON.stringify(paints.columns)} expected ${expected}`)
          assert.ok(paints.composer > .3 && paints.dialog > .3, 'interactive surfaces retain their fill')
          cases++
        }
      }
    }
  }
  // Live controls, overlay interaction, and full CSS restoration on disposal.
  await setRange(page.locator('#__open-sea-skin-panel__-glass-range'), 40)
  await page.locator('#__open-sea-skin-panel__ .oss-close').click()
  await page.screenshot({ path: resolve(output, 'desktop-light-40.png') })
  await page.locator('.settings button').click()
  assert.equal(await page.locator('dialog').isVisible(), true)
  await page.locator('dialog button').click()
  await page.locator('textarea').fill('Desktop glass regression')
  assert.equal(await page.locator('textarea').inputValue(), 'Desktop glass regression')
  await page.locator('#__open-sea-skin-btn__').click()
  await page.locator('#__open-sea-skin-panel__-enabled').uncheck()
  assert.equal(await page.locator('#__open-sea-skin-glass__').count(), 0)
  assert.equal(await page.locator('#__open-sea-skin__').count(), 0)
  await page.locator('#__open-sea-skin-panel__-enabled').check()
  await waitForOcean(page)
  assert.equal(await page.locator('#__open-sea-skin__').count(), 1)
  await page.evaluate(() => window.stopOpenSea())
  assert.equal(await page.locator('#__open-sea-skin-glass__').count(), 0)
  assert.equal(await page.locator('#__open-sea-skin-btn__').count(), 0)
  assert.deepEqual(failures, [])
  console.log(`✓ Desktop shell: ${cases} mode/material/theme/opacity combinations, controls, dialogs, disable and disposal`)
} finally {
  await browser.close()
  await server.close()
}
