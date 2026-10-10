import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { chromiumArgs, findChromeForTesting, serveDirectory, waitForOcean, watchPageErrors } from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const server = await serveDirectory(root)
const browser = await chromium.launch({
  executablePath: await findChromeForTesting(chromium.executablePath()),
  headless: process.env.OSS_HEADLESS === '1', args: chromiumArgs(),
})

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const failures = watchPageErrors(page, 'official desktop')
  await page.route('**/open-sea-skin/**', async route => {
    const url = new URL(route.request().url())
    const response = await route.fetch({ url: `${server.url}/extension/${url.pathname.split('/open-sea-skin/')[1]}${url.search}` })
    await route.fulfill({ response })
  })
  await page.goto(`${server.url}/tests/fixtures/official-desktop/index.html`)
  await page.evaluate(() => {
    localStorage.setItem('ossAutoCycle', 'false')
    localStorage.setItem('ossGlass', '40')
    window.__ModuleLoader__ = { load({ factory }) {
      const plugin = factory(() => {})
      plugin.apply({ effect(fn) { window.stopOpenSea = fn() } })
    } }
  })
  await page.addScriptTag({ path: resolve(root, 'plugin/client.js') })
  await waitForOcean(page)

  for (const platform of ['darwin', 'windows']) {
    for (const dark of [true, false]) {
      await page.evaluate(({ platform, dark }) => {
        document.documentElement.toggleAttribute('data-windows-titlebar', platform === 'windows')
        if (platform === 'darwin') document.documentElement.dataset.platform = 'darwin'
        else delete document.documentElement.dataset.platform
        document.body.toggleAttribute('data-ds-dark-theme', dark)
        document.querySelector('.settings').classList.add('open')
      }, { platform, dark })
      const paints = await page.evaluate(() => {
        const alpha = selector => {
          const values = getComputedStyle(document.querySelector(selector)).backgroundColor.match(/[\d.]+/g).map(Number)
          return values.length === 4 ? values[3] : 1
        }
        const effective = selector => {
          let result = 0
          for (let node = document.querySelector(selector); node && node !== document.body; node = node.parentElement) {
            const values = getComputedStyle(node).backgroundColor.match(/[\d.]+/g).map(Number)
            const value = values.length === 4 ? values[3] : 1
            result = 1 - (1 - result) * (1 - value)
          }
          return result
        }
        return {
          columns: ['.sidebar', '.conversation', '[data-dockkit-content]'].map(effective),
          composer: alpha('.composer'),
          settings: alpha('[data-shortcut-modal="settings"]'),
        }
      })
      const expected = .4
      for (const value of paints.columns) assert.ok(Math.abs(value - expected) < .005,
        `${platform}/${dark ? 'dark' : 'light'}: columns ${JSON.stringify(paints.columns)} expected ${expected}`)
      assert.ok(paints.composer >= .4, 'composer retains its own surface')
      assert.ok(paints.settings >= .96, 'settings stays legible over the ocean')
    }
  }
  await page.evaluate(() => window.stopOpenSea())
  assert.equal(await page.locator('#__open-sea-skin-glass__').count(), 0)
  assert.deepEqual(failures, [])
  console.log('✓ Official Desktop 0.2.x shell: unified columns and readable settings in macOS/Windows light/dark modes')
} finally {
  await browser.close()
  await server.close()
}
