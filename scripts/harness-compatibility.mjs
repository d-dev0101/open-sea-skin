// Real packaged Harness runtime smoke, isolated from the user's Harness home.
// OSS_DSH_APP=/path/to/DeepSeek\ Harness.app OSS_PLUGIN_SPEC=/path/to/package.tgz node scripts/harness-compatibility.mjs
// This exercises the shipped CLI with a fresh `web` profile on macOS. It is NOT
// native Desktop profile/UI or Windows coverage; platform attributes below are
// browser emulation. Always pass the exact candidate tarball under test.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { chromium } from 'playwright'
import { chromiumArgs, findChromeForTesting, setRange, waitForOcean } from './browser-support.mjs'

const app = process.env.OSS_DSH_APP
if (!app || process.platform !== 'darwin') throw new Error('Set OSS_DSH_APP to an official macOS Harness app bundle; this smoke runs on macOS.')
const evidence = resolve(process.env.OSS_COMPAT_EVIDENCE ?? await mkdtemp(join(tmpdir(), 'open-sea-harness-compat-')))
await mkdir(evidence, { recursive: true })
const home = await mkdtemp(join(evidence, 'home-'))
const executable = resolve(app, 'Contents/MacOS/DeepSeek Harness')
const cli = resolve(app, 'Contents/Resources/app.asar/dsh/node_modules/@deepseek-ai/dsh/lib/bin.js')
const spec = process.env.OSS_PLUGIN_SPEC
if (!spec) throw new Error('Set OSS_PLUGIN_SPEC to the exact candidate package tarball or registry version to test.')
const env = { ...process.env, DSH_HOME: home, ELECTRON_RUN_AS_NODE: '1' }
const redact = text => text.replace(/([?&]token=)[^\s&]+/g, '$1[redacted]')
let server, browser

async function command(args) {
  const child = spawn(executable, ['--expose-internals', cli, ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  child.stdout.on('data', chunk => { output += chunk })
  child.stderr.on('data', chunk => { output += chunk })
  let forcedKill
  const timeout = setTimeout(() => {
    child.kill('SIGTERM')
    forcedKill = setTimeout(() => child.kill('SIGKILL'), 10000)
  }, 180000)
  try {
    const [code] = await once(child, 'exit')
    assert.equal(code, 0, redact(output))
    return output
  } finally { clearTimeout(timeout); clearTimeout(forcedKill) }
}

async function start() {
  server = spawn(executable, ['--expose-internals', cli, 'web', '--host', '127.0.0.1', '--port', '0', '--no-open'], { env, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  return await new Promise((resolveURL, reject) => {
    const timer = setTimeout(() => reject(new Error(`Host startup timed out: ${redact(output)}`)), 60000)
    const consume = chunk => {
      output += chunk
      const match = output.match(/dsh web: (http:\/\/127\.0\.0\.1:\d+\/\?token=[^\s]+)/)
      if (match) { clearTimeout(timer); resolveURL(match[1]) }
    }
    server.stdout.on('data', consume)
    server.stderr.on('data', consume)
    server.once('error', error => { clearTimeout(timer); reject(error) })
    server.once('exit', code => { clearTimeout(timer); reject(new Error(`Host exited ${code}: ${redact(output)}`)) })
  })
}

async function stop() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return
  const child = server
  child.kill('SIGTERM')
  const timer = setTimeout(() => child.kill('SIGKILL'), 10000)
  try { await once(child, 'exit') } finally { clearTimeout(timer); server = undefined }
}

try {
  const version = (await command(['--version'])).trim()
  const install = await command(['plugin', '--profile', 'web', 'add', spec, '--registry=https://registry.npmjs.org'])
  await writeFile(join(evidence, 'install.log'), redact(install))
  const manifestPath = join(home, 'profiles/web/package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.ok(manifest.dependencies['open-sea-skin'])
  assert.ok(manifest.dsh.profile.bundles.includes('open-sea-skin'))
  const url = await start()
  browser = await chromium.launch({ executablePath: await findChromeForTesting(chromium.executablePath()), headless: true, args: chromiumArgs() })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    localStorage.setItem('ossAutoCycle', 'false')
    localStorage.setItem('ossGlass', '40')
  })
  await page.goto(url)
  await waitForOcean(page)
  const content = await page.request.get(new URL('/open-sea-skin/ocean.js', url).href)
  assert.equal(content.status(), 200)
  assert.ok((await content.text()).includes('WebGPURenderer'))
  const slots = await page.locator('[data-slot]').evaluateAll(els => [...new Set(els.map(el => el.dataset.slot))])
  assert.ok(slots.includes('main.conversation'))
  const paints = []
  for (const dark of [false, true]) {
    await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' })
    await page.waitForFunction(dark => document.body.hasAttribute('data-ds-dark-theme') === dark, dark)
    for (const platform of ['web', 'darwin', 'windows']) {
      await page.evaluate(platform => {
        if (platform === 'darwin') document.documentElement.dataset.platform = 'darwin'
        else delete document.documentElement.dataset.platform
        document.documentElement.toggleAttribute('data-windows-titlebar', platform === 'windows')
      }, platform)
      for (const glass of [40, 90]) {
        await setRange(page.locator('#__open-sea-skin-panel__-glass-range'), glass)
        const paint = await page.evaluate(({ dark, platform, glass }) => {
          const fill = el => el ? getComputedStyle(el).backgroundColor : null
          const root = document.querySelector('[data-slot="main.conversation"]')
          const editor = root?.querySelector('[contenteditable="true"]')
          const card = editor?.closest('[class$="_card"]')
          const panel = document.querySelector('#__open-sea-skin-panel__')
          return { dark, platform, glass, bodyDark: document.body.hasAttribute('data-ds-dark-theme'),
            inputToken: root && getComputedStyle(root).getPropertyValue('--dsw-specific-input-major'),
            sidebar: fill(document.querySelector('[data-slot="sidebar"] > div')),
            editor: fill(editor), composer: fill(card), composerRadius: card && getComputedStyle(card).borderRadius,
            hostRadius: card && getComputedStyle(card).getPropertyValue('--dsw-radius-panel').trim(),
            controls: fill(panel), controlsColor: panel && getComputedStyle(panel).color }
        }, { dark, platform, glass })
        const rgba = paint.composer?.match(/[\d.]+/g)?.map(Number)
        assert.ok(rgba?.length === 4, `Composer must be translucent, got ${paint.composer}`)
        const expected = dark ? Math.max(.4, glass / 100 - .12) : glass / 100
        assert.ok(Math.abs(rgba[3] - expected) < .005, `Composer opacity: ${JSON.stringify(paint)}`)
        assert.ok(parseFloat(paint.composerRadius) > 0, 'Keep the official composer rounded')
        assert.equal(paint.composerRadius, paint.hostRadius, 'Keep the official composer radius token')
        if (platform !== 'web') assert.equal(paint.sidebar, 'rgba(0, 0, 0, 0)', 'Avoid a second desktop sidebar paint')
        assert.equal(paint.controls, 'rgba(10, 14, 20, 0.82)', 'Controls must keep their dark surface in either theme')
        assert.equal(paint.controlsColor, 'rgb(238, 244, 246)', 'Controls must keep readable light text')
        paints.push(paint)
      }
    }
  }
  assert.deepEqual(errors, [])
  await browser.close(); browser = undefined
  await stop()
  const uninstall = await command(['plugin', '--profile', 'web', 'remove', 'open-sea-skin'])
  await writeFile(join(evidence, 'uninstall.log'), redact(uninstall))
  const after = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.ok(!after.dependencies?.['open-sea-skin'])
  assert.ok(!after.dsh.profile.bundles.includes('open-sea-skin'))
  const restartURL = await start()
  browser = await chromium.launch({ executablePath: await findChromeForTesting(chromium.executablePath()), headless: true, args: chromiumArgs() })
  const installPage = await browser.newPage()
  installPage.on('pageerror', error => errors.push(error.message))
  await installPage.goto(restartURL)
  await installPage.locator('[data-slot="main.conversation"]').waitFor()
  assert.equal(await installPage.locator('#__open-sea-skin__').count(), 0, 'Uninstalled renderer must not return after restart')
  const continueButton = installPage.getByRole('button', { name: '继续', exact: true })
  await continueButton.waitFor({ timeout: 5000 }).catch(() => {})
  if (await continueButton.isVisible()) await continueButton.click()
  const onboardingClose = installPage.getByRole('button', { name: '关闭', exact: true })
  await onboardingClose.waitFor({ timeout: 5000 }).catch(() => {})
  if (await onboardingClose.isVisible()) await onboardingClose.click()
  await installPage.getByRole('button', { name: '插件', exact: true }).click()
  await installPage.getByRole('button', { name: '添加插件', exact: true }).click()
  await installPage.locator('[role="dialog"] input').first().fill(spec)
  await installPage.getByRole('button', { name: '安装', exact: true }).click()
  const enableButton = installPage.getByRole('button', { name: '立即启用', exact: true })
  await enableButton.waitFor({ timeout: 180000 })
  await enableButton.click()
  await waitForOcean(installPage)
  const guiManifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  assert.ok(guiManifest.dependencies?.['open-sea-skin'])
  assert.ok(guiManifest.dsh.profile.bundles.includes('open-sea-skin'))
  assert.deepEqual(errors, [])
  await browser.close(); browser = undefined
  await stop()
  await command(['plugin', '--profile', 'web', 'remove', 'open-sea-skin'])
  const result = { harness: version, pluginSpec: spec, evidence, isolation: 'fresh DSH_HOME; no user data',
    coverage: 'Official packaged macOS runtime, fresh web profile: CLI install, host, actual Web client, WebGPU, dark/light and emulated platform attributes, uninstall/restart, graphical Add Plugin install/enable. Not native Desktop profile/UI or Windows E2E.',
    slots, paints, errors, installed: true, rendererLoaded: true, uninstallRestarted: true, webGuiInstalledAndEnabled: true }
  await writeFile(join(evidence, 'result.json'), JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ harness: version, installed: true, rendererLoaded: true, uninstallRestarted: true, webGuiInstalledAndEnabled: true, evidence }))
} finally {
  await browser?.close()
  await stop()
}
