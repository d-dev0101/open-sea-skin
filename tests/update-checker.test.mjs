import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

const source = await readFile(new URL('../shared/update-checker.js', import.meta.url), 'utf8')
const NPM_LATEST = 'https://registry.npmjs.org/open-sea-skin/latest'
const RELEASE_LATEST = 'https://api.github.com/repos/d-dev0101/open-sea-skin/releases/latest'
const create = runInNewContext(`${source}\nOpenSeaUpdateChecker.create`, { AbortController, setTimeout, clearTimeout })
const json = value => ({ ok: true, json: async () => value })
const published = version => json({ name: 'open-sea-skin', version })
const version = (value, extra = {}) => ({ version: value, bundle: true, prerelease: false, ...extra })
const listed = (versions = [], installed = '1.2.8') => ({ ok: true, value: {
  status: 'listed', installed, registry: 'https://registry.npmmirror.com', attempts: [], versions, omitted: 0,
} })
const ctxFor = manager => ({ get: name => name === 'remote.pluginManager' ? manager : undefined })
const release = (value = '1.2.9', asset = `open-sea-skin-extension-v${value}.zip`) => ({
  tag_name: `v${value}`, draft: false, prerelease: false,
  assets: [{ name: asset, state: 'uploaded', size: 4096 }],
})

test('official manager uses the current profile source and compatible stable candidate', async () => {
  let called = 0
  const checker = create({ currentVersion: '1.2.8', ctx: ctxFor({
    listVersions: async (name, options, signal) => {
      called++
      assert.equal(name, 'open-sea-skin')
      assert.deepEqual(Object.keys(options), []) // No hardcoded registry override.
      assert.equal(signal.aborted, false)
      return listed([
        version('2.0.0', { incompatible: { reason: 'Newer host required' } }),
        version('1.4.0-beta.1', { prerelease: true }),
        version('1.3.0', { deprecated: 'withdrawn' }),
        version('1.2.99', { bundle: false }),
        version('1.2.9'),
      ])
    },
  }), fetch: () => { throw new Error('Must not bypass the selected host registry') } })
  const result = await checker.check()
  assert.equal(result.status, 'available')
  assert.equal(result.latest, '1.2.9')
  assert.equal(result.source, 'Harness')
  assert.equal(called, 1)
})

test('a successful empty host list is current; incompatible or prerelease updates are unavailable', async () => {
  for (const [versions, expected] of [
    [[], 'current'],
    [[version('1.2.9', { incompatible: {} })], 'unavailable'],
    [[version('1.2.9-rc.1', { prerelease: true })], 'unavailable'],
  ]) {
    const checker = create({ currentVersion: '1.2.8', ctx: ctxFor({ listVersions: async () => listed(versions) }) })
    assert.equal((await checker.check()).status, expected)
  }
})

test('host compares against the loaded skin version when the profile has changed', async () => {
  const checker = create({ currentVersion: '1.2.10', ctx: ctxFor({
    listVersions: async () => listed([version('1.2.10'), version('1.2.9')], '1.2.8'),
  }) })
  assert.equal((await checker.check()).status, 'current')
})

test('a newer installed bundle requests restart instead of claiming the running page is current', async () => {
  for (const versions of [[], [version('1.4.0')]]) {
    const checker = create({ currentVersion: '1.2.9', ctx: ctxFor({
      listVersions: async () => listed(versions, '1.3.0'),
    }) })
    const result = await checker.check()
    assert.equal(result.status, 'restart')
    assert.equal(result.latest, '1.3.0')
    assert.equal(result.source, 'Harness')
  }
})

test('local archive/Git installs receive guidance; host failures never become latest or silently switch sources', async () => {
  for (const problem of ['not-updatable', 'not-found', 'network', 'unknown']) {
    const checker = create({ currentVersion: '1.2.8', ctx: ctxFor({ listVersions: async () => ({
      ok: true, value: { status: 'refused', problem, reason: 'test', attempts: [] },
    }) }), fetch: () => { throw new Error('Must not bypass the selected host registry') } })
    if (problem === 'not-updatable') assert.equal((await checker.check()).status, 'unsupported')
    else await assert.rejects(checker.check(), /could not check/)
  }
})

test('legacy host uses anonymous fixed npm metadata without relying on injected services', async () => {
  let request
  const ctx = { get: () => undefined }
  Object.defineProperty(ctx, 'remote', { get() { throw new Error('Undeclared service access') } })
  Object.defineProperty(ctx, 'pluginNavigation', { get() { throw new Error('Undeclared service access') } })
  const checker = create({ currentVersion: '1.2.8', ctx, fetch: async (url, options) => {
    request = { url, options }; return published('1.2.10')
  } })
  assert.equal((await checker.check()).latest, '1.2.10')
  assert.equal(request.url, NPM_LATEST)
  assert.equal(request.options.method, 'GET')
  assert.equal(request.options.credentials, 'omit')
  assert.equal(request.options.referrerPolicy, 'no-referrer')
  assert.equal(request.options.body, undefined)
  assert.equal(request.options.redirect, 'error')
  assert.equal(checker.open(), false)
})

test('old contexts without ctx.get do not block checking or skin initialization', async () => {
  const checker = create({ currentVersion: '1.2.8', ctx: {}, fetch: async () => published('1.2.8') })
  assert.equal((await checker.check()).status, 'current')
})

test('registry versions compare numerically, including ahead and semver prerelease/build behavior', async () => {
  for (const [installed, latest, expected] of [
    ['1.2.9', '1.2.10', 'available'],
    ['1.10.0', '1.9.99', 'ahead'],
    ['1.2.8', '1.2.8', 'current'],
    ['1.2.9-rc.9', '1.2.9', 'available'],
    ['1.2.9+local', '1.2.9', 'current'],
    ['1.2.8', '1.2.9-rc.1', 'unavailable'],
  ]) {
    const checker = create({ currentVersion: installed, fetch: async () => published(latest) })
    assert.equal((await checker.check()).status, expected, `${installed} vs ${latest}`)
  }
})

test('success is cached in memory for six hours; manual check bypasses and expiry refreshes it', async () => {
  let clock = 1000, calls = 0
  const checker = create({ currentVersion: '1.2.8', now: () => clock,
    fetch: async () => { calls++; return published(calls === 1 ? '1.2.8' : '1.2.9') },
  })
  assert.equal((await checker.check()).status, 'current')
  clock += 1000
  assert.equal((await checker.check()).status, 'current')
  assert.equal(calls, 1)
  assert.equal((await checker.check({ force: true })).status, 'available')
  assert.equal(calls, 2)
  clock += 6 * 60 * 60 * 1000
  assert.equal((await checker.check()).status, 'available')
  assert.equal(calls, 3)
})

test('a late-installed host capability replaces the fallback cache', async () => {
  let manager
  const checker = create({ currentVersion: '1.2.8', ctx: { get: () => manager }, fetch: async () => published('1.2.9') })
  assert.equal((await checker.check()).status, 'available')
  manager = { listVersions: async () => listed([]) }
  assert.equal((await checker.check()).status, 'current')
})

test('fresh Cordis tracing proxies still share one successful version check', async () => {
  let calls = 0
  const ctx = { get: () => ({ listVersions: async () => { calls++; return listed([]) } }) }
  const checker = create({ currentVersion: '1.2.8', ctx })
  await checker.check()
  await checker.check()
  assert.equal(calls, 1)
})

test('a failed forced refresh invalidates a previously successful latest status', async () => {
  let online = true
  const checker = create({ currentVersion: '1.2.8', fetch: async () => {
    if (!online) throw new Error('offline')
    return published('1.2.8')
  } })
  assert.equal((await checker.check()).status, 'current')
  online = false
  await assert.rejects(checker.check({ force: true }), /offline/)
  await assert.rejects(checker.check(), /offline/)
})

test('offline and malformed responses fail without poisoning the cache', async () => {
  const responses = [
    async () => { throw new Error('offline') },
    async () => ({ ok: false }),
    async () => json({ name: 'someone-else', version: '1.2.8' }),
    async () => published('<img src=x onerror=alert(1)>'),
    async () => published('01.2.8'),
    async () => published('1.2.8'),
  ]
  const checker = create({ currentVersion: '1.2.8', fetch: () => responses.shift()() })
  for (let index = 0; index < 5; index++) await assert.rejects(checker.check())
  assert.equal((await checker.check()).status, 'current')
})

test('invalid host RPC results are errors, never a latest-version status', async () => {
  for (const answer of [
    { ok: false, error: { message: 'Permission denied' } },
    { ok: true, value: null },
    listed([version('1.2.9', { version: '<script>' })]),
    listed([{ version: '1.2.9' }]),
  ]) {
    const checker = create({ currentVersion: '1.2.8', ctx: ctxFor({ listVersions: async () => answer }) })
    await assert.rejects(checker.check())
  }
})

test('timeout ends a hanging RPC even when the underlying transport ignores abort', async () => {
  let downstreamSignal
  const checker = create({ currentVersion: '1.2.8', timeoutMs: 10, ctx: ctxFor({
    listVersions: async (_name, _options, signal) => { downstreamSignal = signal; return new Promise(() => {}) },
  }) })
  await assert.rejects(checker.check(), /timed out/)
  assert.equal(downstreamSignal.aborted, true)
})

test('unload abort cancels the request and does not cache its eventual result', async () => {
  let downstreamSignal, finish, calls = 0
  const checker = create({ currentVersion: '1.2.8', fetch: async (_url, options) => {
    calls++
    if (calls > 1) return published('1.2.9')
    downstreamSignal = options.signal
    return new Promise(resolve => { finish = resolve })
  } })
  const controller = new AbortController()
  const pending = checker.check({ signal: controller.signal })
  await Promise.resolve()
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(downstreamSignal.aborted, true)
  finish(published('1.2.8'))
  await Promise.resolve()
  assert.equal((await checker.check()).status, 'available')
  assert.equal(calls, 2)
  await assert.rejects(checker.check({ signal: controller.signal }), { name: 'AbortError' })
})

test('extension checks released ZIP metadata instead of npm, without added browser permissions', async () => {
  const checker = create({ currentVersion: '1.2.8', kind: 'extension', fetch: async (url, options) => {
    assert.equal(url, RELEASE_LATEST)
    assert.equal(options.credentials, 'omit')
    return json(release())
  } })
  assert.equal((await checker.check()).status, 'available')
  assert.equal(checker.open(), false)
})

test('release publication without this adapter artifact cannot advertise an update', async () => {
  for (const metadata of [release('1.2.9', 'source.zip'), { ...release(), assets: [] },
    { ...release(), assets: [{ name: 'open-sea-skin-extension-v1.2.9.zip', state: 'new', size: 0 }] }]) {
    const checker = create({ currentVersion: '1.2.8', kind: 'extension', fetch: async () => json(metadata) })
    assert.equal((await checker.check()).status, 'unavailable')
  }
  const native = create({ currentVersion: '1.2.8', kind: 'native',
    fetch: async () => json(release('1.2.9', 'open-sea-skin-1.2.9.tgz')),
  })
  assert.equal((await native.check()).status, 'available')
})

test('only valid published release versions can be displayed', async () => {
  for (const metadata of [{ ...release(), draft: true }, { ...release(), prerelease: true },
    { ...release(), tag_name: 'not-a-version' }, { ...release(), tag_name: 'v1.2.9<script>' }]) {
    const checker = create({ currentVersion: '1.2.8', kind: 'extension', fetch: async () => json(metadata) })
    await assert.rejects(checker.check())
  }
})

test('update action opens only the official package detail and never initiates installation', () => {
  const opened = []
  const ctx = { get: name => name === 'pluginNavigation' ? { openBundle: packageName => opened.push(packageName) } : undefined }
  const checker = create({ currentVersion: '1.2.8', ctx })
  assert.equal(checker.open(), true)
  assert.deepEqual(opened, ['open-sea-skin'])
  ctx.get = () => { throw new Error('Service disposed') }
  assert.equal(checker.open(), false)
})
