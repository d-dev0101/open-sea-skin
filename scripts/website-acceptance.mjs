import assert from 'node:assert/strict'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import {
  chromiumArgs, findChromeForTesting, serveDirectory, setRange, waitForOcean, watchPageErrors,
} from './browser-support.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pages = resolve(root, 'pages-dist')
const chrome = await findChromeForTesting(chromium.executablePath())
const server = await serveDirectory(pages)
const browser = await chromium.launch({
  executablePath: chrome,
  headless: process.env.OSS_HEADLESS === '1',
  args: chromiumArgs(),
})

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const failures = watchPageErrors(page, 'website')
  const failedResponses = []
  page.on('response', (response) => {
    if (response.status() >= 400 && response.url().startsWith(server.url)) {
      failedResponses.push(`${response.status()} ${response.url()}`)
    }
  })

  await page.goto(server.url, { waitUntil: 'domcontentloaded' })
  const ocean = await waitForOcean(page, '#ocean-frame')
  await page.locator('#renderer-status.ready').waitFor()

  assert.equal(await page.locator('#sea-output').textContent(), '56')
  assert.equal(await page.locator('#transparency-output').textContent(), '64%')

  await page.locator('[data-preset="sunset"]').click()
  await page.waitForTimeout(250)
  assert.equal(await page.locator('#sea-state').inputValue(), '44')
  assert.equal(await page.locator('#daylight').inputValue(), '18')
  assert.equal(await page.locator('#transparency').inputValue(), '68')
  const sunset = await ocean.locator('body').evaluate(() => globalThis.__ossState())
  assert.ok(Math.abs(sunset.sea - 0.91) < 0.02, JSON.stringify(sunset))
  assert.ok(Math.abs(sunset.daylight - 18) < 0.02, JSON.stringify(sunset))

  await setRange(page.locator('#transparency'), 74)
  assert.equal(await page.locator('#transparency-output').textContent(), '74%')
  assert.equal(await page.locator('html').evaluate(element => element.style.getPropertyValue('--glass-alpha')), '0.26')

  await page.locator('[data-theme-choice="light"]').click()
  assert.equal(await page.locator('html').getAttribute('data-ui-theme'), 'light')
  await page.locator('#language-toggle').click()
  assert.match(await page.title(), /Ocean skin for DeepSeek Harness/)
  assert.equal(await page.locator('#hero-title').innerText(), 'Give Harness\nits own horizon')

  await page.locator('#gallery').scrollIntoViewIfNeeded()
  const images = page.locator('#gallery img')
  await assert.doesNotReject(async () => {
    await page.waitForFunction(() => [...document.querySelectorAll('#gallery img')]
      .every(image => image.complete && image.naturalWidth > 0), undefined, { timeout: 15_000 })
  })
  assert.equal(await images.count(), 4)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.locator('#top').scrollIntoViewIfNeeded()
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
  assert.equal(await page.locator('.brand').first().isVisible(), true)
  assert.equal(await page.locator('.control-dock').isVisible(), true)

  assert.deepEqual(failedResponses, [])
  assert.deepEqual(failures, [])
  console.log('✓ Website ocean, presets, transparency, themes, language, gallery and mobile layout')
} finally {
  await browser.close()
  await server.close()
}
