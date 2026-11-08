import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

// Run the real frame scheduler with a deterministic display clock. No GPU is
// needed to detect a recovery threshold above the selected frame-rate cap.
const source = await readFile(new URL('../shared/ocean.js', import.meta.url), 'utf8')
const scheduler = source.slice(source.indexOf('let renderer = null;'), source.indexOf('async function boot()'))
const visibilityHandler = source.slice(
  source.indexOf("document.addEventListener('visibilitychange'"),
  source.indexOf('// --- initialize the GPU'),
)

function createHarness({ low = false, reduced = false, skin = true } = {}) {
  let now = 1000
  let onVisibility
  let renderCount = 0
  const resolutions = []
  const loops = []
  const doc = {
    hidden: false,
    addEventListener(event, listener) { if (event === 'visibilitychange') onVisibility = listener },
  }
  const actual = runInNewContext(`${scheduler}
    renderer = rendererStub;
    postProcessing = { render: recordRender };
    controls = { update() {} };
    firstFrameShown = true;
    loopStarted = true;
    resetFrameTiming();
    ${visibilityHandler}
    ({ animate, applyFallbackBudget,
      state: () => ({ scale: renderScale, cap: FRAME_RATE_CAP, pixelCap: PIXEL_RATIO_CAP, elapsed: uTime.value })
    })`, {
    REDUCED_MOTION: reduced, LOW_END_DEVICE: low, SKIN: skin,
    performance: { now: () => now },
    window: { devicePixelRatio: 2, innerWidth: 1440, innerHeight: 900 },
    document: doc, uTime: { value: 0 }, manualTimeOfDay: true, fpsReadout: null,
    recordRender: () => { renderCount++ },
    rendererStub: {
      setPixelRatio(value) { resolutions.push(value) }, setSize() {},
      setAnimationLoop(callback) { loops.push(callback) },
    },
  })
  return {
    ...actual, resolutions, loops,
    get renderCount() { return renderCount },
    tick(milliseconds, displayHz = 60) {
      for (let i = 0; i < Math.round(milliseconds * displayHz / 1000); i++) {
        now += 1000 / displayHz
        actual.animate(now)
      }
    },
    visibility(hidden, elapsed = 0) { now += elapsed; doc.hidden = hidden; onVisibility() },
  }
}

test('low, reduced-motion and showcase modes recover after a temporary slow frame period', () => {
  for (const options of [{ low: true }, { reduced: true }, { skin: false }]) {
    const renderer = createHarness(options)
    renderer.tick(5000, 5)
    const degraded = renderer.state().scale
    assert.ok(degraded < 1, 'slow rendering should lower resolution')
    renderer.tick(7000)
    assert.ok(renderer.state().scale > degraded, 'recovery must be possible without exceeding the FPS cap')
    assert.ok(renderer.state().scale <= 1)
  }
})

test('a long hidden pause does not count as slow rendering or advance the ocean clock', () => {
  const renderer = createHarness({ low: true })
  renderer.tick(1100)
  const before = renderer.state()
  renderer.visibility(true)
  assert.equal(renderer.loops.at(-1), null)
  renderer.visibility(false, 60000)
  assert.equal(typeof renderer.loops.at(-1), 'function')
  renderer.tick(3000)
  assert.equal(renderer.state().scale, before.scale)
  assert.ok(Math.abs(renderer.state().elapsed - before.elapsed - 3) < 0.01)
})

test('WebGL fallback respects reduced motion and enforces each selected frame budget', () => {
  for (const reduced of [false, true]) {
    const renderer = createHarness({ reduced })
    renderer.applyFallbackBudget()
    assert.equal(renderer.state().cap, reduced ? 20 : 30)
    assert.equal(renderer.state().pixelCap, reduced ? 0.9 : 1)
    renderer.tick(10000, 120)
    assert.ok(renderer.renderCount <= (reduced ? 201 : 301), 'fallback must respect its frame cap')
    assert.ok(renderer.state().scale > 0.6, 'fallback can recover from its conservative starting resolution')
  }
})
