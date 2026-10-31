import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { chromiumArgs, findChromeForTesting, serveDirectory, setRange, waitForOcean, watchPageErrors } from './browser-support.mjs'

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
  await page.locator('#__open-sea-skin-btn__').click()

  for (const platform of ['darwin', 'windows']) {
    for (const dark of [true, false]) {
      for (const glass of [40, 90]) {
      await setRange(page.locator('#__open-sea-skin-panel__-glass-range'), glass)
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
        // Composite the glass and translucent text over white: the brightest
        // possible ocean backdrop, so helper text must remain readable here.
        const controlsContrast = selector => {
          const rgba = value => value.match(/[\d.]+/g).map(Number)
          const blend = (front, back) => front.slice(0, 3).map((channel, i) => channel * (front[3] ?? 1) + back[i] * (1 - (front[3] ?? 1)))
          const luminance = rgb => rgb.map(channel => {
            const c = channel / 255
            return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4
          }).reduce((sum, channel, i) => sum + channel * [.2126, .7152, .0722][i], 0)
          const background = blend(rgba(getComputedStyle(document.querySelector('#__open-sea-skin-panel__')).backgroundColor), [255, 255, 255])
          const foreground = blend(rgba(getComputedStyle(document.querySelector(selector)).color), background)
          const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
          return (values[0] + .05) / (values[1] + .05)
        }
        return {
          columns: ['.sidebar-root', '.conversation', '[data-dockkit-content]', '[data-shell-bottom]'].map(effective),
          cards: ['[data-composer-card]', '.conversation .message-bubble', '.conversation .tool-details', '.conversation .md-code-block', '.conversation pre', '[data-code-block-banner]'].map(alpha),
          otherPluginCards: ['.plugin-dialog .composer', '.plugin-dialog .message-bubble', '.plugin-dialog .tool-details'].map(alpha),
          composerRadius: getComputedStyle(document.querySelector('[data-composer-card]')).borderRadius,
          syntaxColor: getComputedStyle(document.querySelector('.syntax-token')).color,
          settings: alpha('[data-shortcut-modal="settings"]'),
          marketplace: alpha('.marketplace'),
          pluginDialog: alpha('.plugin-dialog'),
          quickControls: getComputedStyle(document.querySelector('#__open-sea-skin-panel__')).backgroundColor,
          quickControlsColor: getComputedStyle(document.querySelector('#__open-sea-skin-panel__')).color,
          quickControlsNoteContrast: controlsContrast('#__open-sea-skin-panel__ .oss-note'),
          launcher: alpha('#__open-sea-skin-btn__'),
        }
      })
      const expected = dark ? Math.max(.4, glass / 100 - .12) : glass / 100
      for (const value of paints.columns) assert.ok(Math.abs(value - expected) < .005,
        `${platform}/${dark ? 'dark' : 'light'}: columns ${JSON.stringify(paints.columns)} expected ${expected}`)
      for (const value of paints.cards) assert.ok(Math.abs(value - expected) < .005,
        `${platform}/${dark ? 'dark' : 'light'}: conversation cards ${JSON.stringify(paints.cards)} expected ${expected}`)
      assert.deepEqual(paints.otherPluginCards, [1, 1, 1], 'conversation tokens do not change other plugins')
      assert.equal(paints.composerRadius, '22px', 'keep the host composer radius')
      assert.equal(paints.syntaxColor, 'rgb(90, 140, 220)', 'keep host syntax highlighting')
      assert.ok(paints.settings >= .96, 'settings stays legible over the ocean')
      assert.ok(paints.marketplace >= .96, 'marketplace keeps a readable overlay token')
      assert.ok(paints.pluginDialog >= .96, 'sibling configuration dialog has an independent surface')
      assert.equal(paints.quickControls, 'rgba(10, 14, 20, 0.82)', 'Open Sea controls retain their own dark glass in either host theme')
      assert.equal(paints.quickControlsColor, 'rgb(238, 244, 246)', 'Open Sea controls keep readable light text')
      assert.ok(paints.quickControlsNoteContrast >= 4.5, 'helper text stays readable even over a white ocean backdrop')
      assert.ok(paints.launcher >= .75, 'launcher retains a contrasting dark fill when open')
      assert.equal(await page.locator('[data-shell-overlay]').evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)')
      if (process.env.OSS_SCREENSHOTS && platform === 'windows' && glass === 40) {
        await page.screenshot({ path: `${process.env.OSS_SCREENSHOTS}/overlay-${dark ? 'dark' : 'light'}.png` })
        await page.locator('.settings, .marketplace, .plugin-dialog').evaluateAll(elements => elements.forEach(el => { el.hidden = true; el.style.display = 'none' }))
        await page.screenshot({ path: `${process.env.OSS_SCREENSHOTS}/conversation-${dark ? 'dark' : 'light'}.png` })
        await page.locator('.settings, .marketplace, .plugin-dialog').evaluateAll(elements => elements.forEach(el => { el.hidden = false; el.style.removeProperty('display') }))
      }
      }
    }
  }
  await page.evaluate(() => window.stopOpenSea())
  assert.equal(await page.locator('#__open-sea-skin-glass__').count(), 0)
  assert.deepEqual(failures, [])
  console.log('✓ Official Desktop 0.2.1-rc.5 surface fixture: unified columns, translucent conversation cards and readable independent dialogs in macOS/Windows light/dark modes at 40%/90%')
} finally {
  await browser.close()
  await server.close()
}
