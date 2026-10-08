import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const text = async relative => (await readFile(resolve(root, relative))).toString('utf8')

test('the shared controller offers an opt-in static scene', async () => {
  const core = await text('shared/skin-core.js')
  // Opt-in on purpose: upgrading must not silently freeze a moving ocean.
  assert.match(core, /freeze: false,/)
  assert.match(core, /freeze: raw\.freeze === true,/)
  assert.match(core, /\$\{IDS\.panel\}-freeze/, 'the panel needs a freeze switch')
  assert.match(core, /\['freeze', 'freeze'\]/, 'the locale-sync label map must include the switch')
  assert.match(core, /静态画面/)
  assert.match(core, /Static scene/)
})

test('the controller hands the static-scene flag to the rendered frame', async () => {
  const core = await text('shared/skin-core.js')
  assert.match(core, /freeze: state\.freeze,/, 'live updates must carry the flag')
  assert.match(core, /freeze: state\.freeze \? '1' : '0',/, 'the initial frame URL must carry the flag')
})

test('every install path persists the static-scene setting', async () => {
  const expectations = [
    ['the DSH bundle', 'plugin/client.js', [
      "freeze: 'ossFreeze'",
      "readSetting('freeze', defaults.freeze)",
      "|| key === 'freeze'",
    ]],
    ['the static installer', 'shared/native-entry.js', [
      "freeze: 'ossFreeze'",
      "read('freeze', defaults.freeze)",
      "|| key === 'freeze'",
    ]],
    ['the browser extension', 'shared/extension-entry.js', [
      'skinFreeze: defaults.freeze',
      'freeze: stored.skinFreeze',
      'skinFreeze: patch.freeze',
      'changes.skinFreeze',
    ]],
  ]
  for (const [label, file, required] of expectations) {
    const source = await text(file)
    for (const needle of required) assert.ok(source.includes(needle), `${label} (${file}) is missing ${needle}`)
  }
})

test('a frozen renderer holds still and repaints on demand', async () => {
  const ocean = await text('shared/ocean.js')
  for (const required of [
    "SKIN_QUERY.get('freeze') === '1'",
    'let needsRender = true',
    "typeof d.freeze === 'boolean' && d.freeze !== FROZEN",
    'if (FROZEN) {',
    'needsRender = false',
    'needsRender = true; // a resized canvas must be repainted even when frozen',
    'needsRender = true; // returning from a hidden tab repaints once',
    'frozen: FROZEN',
  ]) assert.ok(ocean.includes(required), required)

  // The frozen branch has to win over the clock: if it ever ran after the time
  // advance, a "static" scene would keep drifting every frame.
  const frozenBranch = ocean.indexOf('if (FROZEN) {')
  const clock = ocean.indexOf('uTime.value += dt')
  assert.ok(frozenBranch > -1 && clock > -1 && frozenBranch < clock,
    'the frozen branch must precede the wave clock advance')
})
