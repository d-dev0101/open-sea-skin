import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { runInNewContext } from 'node:vm'
import test from 'node:test'

// Evaluate the renderer's actual swell expressions without a GPU. This small
// numeric adapter implements only the TSL operations used by these functions;
// the reference below independently retains the original Gerstner equations.
class Value {
  constructor(values) { this.values = values }
  map(other, operation) {
    const right = other instanceof Value ? other.values : [other]
    const count = Math.max(this.values.length, right.length)
    return new Value(Array.from({ length: count }, (_, i) => operation(
      this.values[this.values.length === 1 ? 0 : i], right[right.length === 1 ? 0 : i],
    )))
  }
  add(other) { return this.map(other, (a, b) => a + b) }
  sub(other) { return this.map(other, (a, b) => a - b) }
  mul(other) { return this.map(other, (a, b) => a * b) }
  dot(other) { return new Value([this.mul(other).values.reduce((sum, value) => sum + value, 0)]) }
  toVar() { return this }
  get x() { return new Value([this.values[0]]) }
  get y() { return new Value([this.values[1]]) }
  get z() { return new Value([this.values[2]]) }
  get w() { return new Value([this.values[3]]) }
}
const vector = (...values) => new Value(values.flatMap(value => value instanceof Value ? value.values : [value]))
const cross = (a, b) => vector(
  a.values[1] * b.values[2] - a.values[2] * b.values[1],
  a.values[2] * b.values[0] - a.values[0] * b.values[2],
  a.values[0] * b.values[1] - a.values[1] * b.values[0],
)
const normalize = value => value.mul(1 / Math.hypot(...value.values))

const source = await readFile(new URL('../shared/ocean.js', import.meta.url), 'utf8')
const swell = source.slice(source.indexOf('const GERSTNER_DEFS ='), source.indexOf('// SECTION 3'))
const actual = runInNewContext(`${swell}\n({ GERSTNER_DEFS, wavePosition, waveSurface })`, {
  Fn: fn => (...args) => fn(args), float: vector, vec2: vector, vec3: vector, vec4: vector,
  sin: value => vector(Math.sin(value.values[0])),
  cos: value => vector(Math.cos(value.values[0])),
  normalize, cross,
})

function reference(x, z, time, sea) {
  let px = x, py = 0, pz = z, crest = 0
  const tangent = [1, 0, 0], bitangent = [0, 0, 1]
  for (const { dx, dy, k, c, a0 } of actual.GERSTNER_DEFS) {
    const phase = k * (dx * x + dy * z - time * c)
    const amplitude = a0 * sea
    px += amplitude * dx * Math.cos(phase)
    py += amplitude * Math.sin(phase)
    pz += amplitude * dy * Math.cos(phase)
    tangent[0] -= amplitude * k * Math.sin(phase) * dx * dx
    tangent[1] += amplitude * k * Math.cos(phase) * dx
    tangent[2] -= amplitude * k * Math.sin(phase) * dx * dy
    bitangent[0] -= amplitude * k * Math.sin(phase) * dx * dy
    bitangent[1] += amplitude * k * Math.cos(phase) * dy
    bitangent[2] -= amplitude * k * Math.sin(phase) * dy * dy
    crest += amplitude * Math.sin(phase)
  }
  return {
    position: [px, py, pz],
    surface: [...normalize(cross(vector(...bitangent), vector(...tangent))).values, crest],
  }
}

test('shared normal/crest evaluation preserves the original swell across space, time and sea states', () => {
  let samples = 0
  for (const time of [0, 0.016, 17.5, 720, 86400]) {
    for (const sea of [0.25, 0.925, 1.09, 1.75]) {
      for (let index = 0; index < 40; index++) {
        const x = -210 + index * 10.75
        const z = 210 * Math.sin(index * 0.37)
        const expected = reference(x, z, time, sea)
        const args = [vector(x, z), vector(time), vector(sea)]
        for (const [key, values] of [
          ['position', actual.wavePosition(...args).values],
          ['surface', actual.waveSurface(...args).values],
        ]) {
          values.forEach((value, axis) => {
            assert.ok(Number.isFinite(value))
            assert.ok(Math.abs(value - expected[key][axis]) < 1e-11,
              `${key}[${axis}] changed at x=${x}, z=${z}, time=${time}, sea=${sea}`)
          })
        }
        samples++
      }
    }
  }
  assert.equal(samples, 800)
})
