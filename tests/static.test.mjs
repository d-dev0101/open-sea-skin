import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const bytes = relative => readFile(resolve(root, relative))
const text = async relative => (await bytes(relative)).toString('utf8')
const sha256 = async relative => createHash('sha256').update(await bytes(relative)).digest('hex')

test('the original showcase is preserved byte-for-byte', async () => {
  assert.equal(await sha256('site/index.html'), '69267b127c956a6cc6202fe0599d216b28cde92b4295a42400f6323e4c0353de')
  assert.equal(await sha256('site/main.js'), '078cbf59811870668e7d1840e70a6ce267038ded8b1e57e4077fbce7ccb5abb4')
})

test('the MV3 manifest keeps the minimum local-only permission surface', async () => {
  const manifest = JSON.parse(await text('extension/manifest.json'))
  assert.equal(manifest.manifest_version, 3)
  assert.deepEqual(manifest.permissions, ['storage'])
  assert.deepEqual(manifest.host_permissions, ['http://127.0.0.1/*', 'http://localhost/*'])
  assert.equal(manifest.content_scripts[0].all_frames, false)
  assert.ok(manifest.web_accessible_resources[0].resources.includes('skin.html'))
  assert.equal(manifest.chrome_url_overrides, undefined)
  assert.equal(manifest.action.default_popup, 'popup.html')
})

test('every install path is generated from the canonical renderer', async () => {
  for (const target of ['extension/ocean.js', 'native-dist/ocean.js', 'harness-plugin/assets/ocean.js']) {
    assert.deepEqual(await bytes(target), await bytes('shared/ocean.js'), target)
  }
  for (const target of ['extension/styles.css', 'native-dist/styles.css', 'harness-plugin/assets/styles.css']) {
    assert.deepEqual(await bytes(target), await bytes('shared/styles.css'), target)
  }
  const extension = await text('extension/content.js')
  const native = await text('native-dist/loader.js')
  const core = await text('shared/skin-core.js')
  assert.ok(extension.includes(core))
  assert.ok(native.includes(core))
  assert.ok((await text('plugin/client.js')).includes(core))
})

test('the repository root is an installable DeepSeek Harness bundle', async () => {
  const pkg = JSON.parse(await text('package.json'))
  assert.deepEqual(pkg.dsh.bundle, { patch: './cordis.patch.yml' })
  assert.deepEqual(pkg.dsh.client, { inject: [], platform: 'web' })
  assert.equal(pkg.main, 'plugin/index.js')
  assert.equal(pkg.exports['./client'], './plugin/client.js')
  assert.match(await text('cordis.patch.yml'), /id: open-sea-skin[\s\S]*name: open-sea-skin/)
  assert.match(await text('plugin/client.js'), /__ModuleLoader__\.load\(\{ id: "open-sea-skin"/)
})

test('vendored three.js is local, patched and licensed', async () => {
  const webgpu = await text('shared/vendor/three.webgpu.js')
  const controls = await text('shared/vendor/addons/controls/OrbitControls.js')
  const bloom = await text('shared/vendor/addons/tsl/display/BloomNode.js')
  assert.match(webgpu, /from"\.\/three\.core\.js"/)
  assert.doesNotMatch(webgpu, /greggman|https?:\/\/[^\s]+webgpu.*debug/i)
  assert.match(controls, /from"\.\.\/\.\.\/three\.webgpu\.js"/)
  assert.match(bloom, /from"\.\.\/\.\.\/\.\.\/three\.webgpu\.js"/)
  assert.match(bloom, /from"\.\.\/\.\.\/\.\.\/three\.tsl\.js"/)
  assert.match(await text('shared/vendor/licenses/three-LICENSE.txt'), /MIT License/)
  assert.match(await text('shared/vendor/licenses/geist-OFL.txt'), /OPEN FONT LICENSE Version 1\.1/)
})

test('shared controller retains duplicate guards, a11y and resilient anchors', async () => {
  const core = await text('shared/skin-core.js')
  for (const required of [
    '__open-sea-skin__',
    '__open-sea-skin-btn__',
    'role',
    "event.key === 'Escape'",
    "event.key !== 'Tab'",
    '[data-slot="sidebar.settings"] button',
    '[data-testid="settings-trigger"]',
    '.VOzbGW_trigger',
    'MutationObserver',
    'prefers-reduced-motion',
  ]) assert.ok(core.includes(required), required)
})

test('the browser extension injects only into a verified Harness page', async () => {
  const entry = await text('shared/extension-entry.js')
  assert.match(entry, /document\.title !== 'DeepSeek Harness'/)
  assert.match(entry, /document\.getElementById\('root'\)/)
  assert.ok(entry.includes('window\\.__DSH_BOOT__'))
})

test('renderer contains the promised performance and security policies', async () => {
  const ocean = await text('shared/ocean.js')
  for (const required of [
    'document.hidden',
    "deviceMemory",
    "prefers-reduced-motion: reduce",
    "ev.source !== window.parent",
    "ev.origin !== SKIN_PARENT_ORIGIN",
    'Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP)',
    'REDUCED_MOTION ? 160 : 256',
    'TARGET_FPS',
    'renderScale',
    'p.sub(floor(p.div(289)).mul(289))',
    '__ossState',
  ]) assert.ok(ocean.includes(required), required)
})

test('native integration keeps modal overlays above every app column', async () => {
  const integration = await text('harness-plugin/integration/update-harness.mjs')
  assert.match(integration, /isolation: isolate; \/\* Open Sea background stacking context \*\//)
  assert.match(integration, /z-index: -1/)
  assert.match(integration, /text = text\.replace/)
  assert.match(integration, /ui-open-sea-skin.*web-search-deepseek/)
})
