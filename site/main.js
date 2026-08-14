// ============================================================================
//  OPEN SEA — realtime Gerstner ocean
//  WebGPU · Three.js 0.178 · TSL node shaders
//
//  Everything visual is generated procedurally on the GPU through TSL node
//  graphs. The CPU only precomputes constant wave parameters, drives uniforms,
//  runs the camera controls and wires the UI.
// ============================================================================

import * as THREE from 'three/webgpu';
import {
  Fn, pass, uniform, float, vec2, vec3, vec4,
  sin, cos, dot, cross, normalize, mix, pow, max, clamp, fract, floor,
  smoothstep, distance, reflect,
  positionLocal, positionWorld, cameraPosition
} from 'three/tsl';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

// ----------------------------------------------------------------------------
// SECTION 1 · SHARED UNIFORMS
// Ocean and sky read the exact same uniform nodes, so reflections, the sun
// disc, speculars and the whole time-of-day palette can never drift apart.
// ----------------------------------------------------------------------------

const uTime = uniform(0);                       // elapsed animation time (s)
const uSea = uniform(0.25 + (45 / 100) * 1.5); // sea-state multiplier, derived from the UI
const uSunDir = uniform(new THREE.Vector3(0, 0.5, -0.87)); // normalized sun direction
const uSunColor = uniform(new THREE.Vector3(1, 1, 1));     // sun base RGB * intensity
const uHorizonColor = uniform(new THREE.Vector3(1, 1, 1));
const uZenithColor = uniform(new THREE.Vector3(1, 1, 1));
const uDeepColor = uniform(new THREE.Vector3(1, 1, 1));
const uShallowColor = uniform(new THREE.Vector3(1, 1, 1));

// ----------------------------------------------------------------------------
// SECTION 2 · GERSTNER SWELL
// Exactly five directional Gerstner components. Directions are normalized and
// k / c / a0 (amplitude per unit sea state) are precomputed once on the CPU.
// ----------------------------------------------------------------------------

const GERSTNER_DEFS = [
  { dir: [1.0, 0.0],     wavelength: 60.0, steepness: 0.12 },
  { dir: [0.6, 0.8],     wavelength: 31.0, steepness: 0.12 },
  { dir: [-0.7, 0.7],    wavelength: 18.0, steepness: 0.09 },
  { dir: [0.3, -0.95],   wavelength: 9.5,  steepness: 0.07 },
  { dir: [-0.35, -0.94], wavelength: 5.0,  steepness: 0.05 },
].map((w) => {
  const len = Math.hypot(w.dir[0], w.dir[1]);
  const dx = w.dir[0] / len;
  const dy = w.dir[1] / len;
  const k = (Math.PI * 2) / w.wavelength; // wave number
  const c = Math.sqrt(9.8 * k);           // angular propagation term
  return { dx, dy, k, c, a0: w.steepness / k };
});

/**
 * Summed Gerstner displacement from a flat surface (x, 0, z):
 *   f  = k * (dot(dir, xz) - time * c)
 *   x += a * dir.x * cos(f)   y += a * sin(f)   z += a * dir.y * cos(f)
 * with a = (steepness / k) * sea. Returns a vec3 with +Y up.
 */
const wavePosition = Fn(([xz, time, sea]) => {
  let x = xz.x;
  let y = float(0);
  let z = xz.y;
  for (const w of GERSTNER_DEFS) {
    const dir = vec2(w.dx, w.dy);
    const f = float(w.k).mul(dir.dot(xz).sub(time.mul(float(w.c))));
    const a = float(w.a0).mul(sea); // sea-state scales steepness, hence amplitude
    x = x.add(a.mul(dir.x).mul(cos(f))); // horizontal X displacement
    y = y.add(a.mul(sin(f)));            // vertical displacement
    z = z.add(a.mul(dir.y).mul(cos(f))); // horizontal Z displacement
  }
  return vec3(x, y, z);
});

/**
 * Analytic swell normal. Instead of screen-space derivatives we accumulate
 * the true tangent (dP/dx) and binormal (dP/dz) of the summed Gerstner field
 * and return normalize(cross(binormal, tangent)) — stable under any view.
 */
const waveNormal = Fn(([xz, time, sea]) => {
  let tx = float(1), ty = float(0), tz = float(0); // tangent   dP/dx
  let bx = float(0), by = float(0), bz = float(1); // binormal  dP/dz
  for (const w of GERSTNER_DEFS) {
    const dir = vec2(w.dx, w.dy);
    const f = float(w.k).mul(dir.dot(xz).sub(time.mul(float(w.c))));
    const a = float(w.a0).mul(sea);
    const s = sin(f);
    const co = cos(f);
    const ak = a.mul(float(w.k)); // a * k
    const aks = ak.mul(s);        // a * k * sin(f)
    const akc = ak.mul(co);       // a * k * cos(f)
    // d/dx of the displaced surface point
    tx = tx.sub(aks.mul(dir.x).mul(dir.x));
    ty = ty.add(akc.mul(dir.x));
    tz = tz.sub(aks.mul(dir.x).mul(dir.y));
    // d/dz of the displaced surface point
    bx = bx.sub(aks.mul(dir.x).mul(dir.y));
    by = by.add(akc.mul(dir.y));
    bz = bz.sub(aks.mul(dir.y).mul(dir.y));
  }
  return normalize(cross(vec3(bx, by, bz), vec3(tx, ty, tz)));
});

/**
 * Signed crest height: the raw sum of a * sin(f) over all five waves.
 * Drives crest coloring, subsurface glow and foam masking.
 */
const waveCrest = Fn(([xz, time, sea]) => {
  let crest = float(0);
  for (const w of GERSTNER_DEFS) {
    const f = float(w.k).mul(vec2(w.dx, w.dy).dot(xz).sub(time.mul(float(w.c))));
    crest = crest.add(float(w.a0).mul(sea).mul(sin(f)));
  }
  return crest;
});

// ----------------------------------------------------------------------------
// SECTION 3 · PROCEDURAL GRADIENT NOISE + FBM
// A tiny reusable 2D noise stack: two-value hash, quintic-interpolated
// gradient noise, then a three-octave FBM with fixed offsets (no tiling).
// ----------------------------------------------------------------------------

// Two dot products with the classic constants, mapped to [-1, 1]^2.
const hash2 = Fn(([p]) => {
  const a = sin(p.dot(vec2(127.1, 311.7))).mul(43758.5453);
  const b = sin(p.dot(vec2(269.5, 183.3))).mul(43758.5453);
  return vec2(fract(a).mul(2).sub(1), fract(b).mul(2).sub(1));
});

// Bilinear gradient noise with the quintic ease f^3 * (f * (f * 6 - 15) + 10).
const gradNoise = Fn(([p]) => {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(f.mul(f.mul(6).sub(15)).add(10));
  const g00 = hash2(i);
  const g10 = hash2(i.add(vec2(1, 0)));
  const g01 = hash2(i.add(vec2(0, 1)));
  const g11 = hash2(i.add(vec2(1, 1)));
  const n00 = g00.dot(f);
  const n10 = g10.dot(f.sub(vec2(1, 0)));
  const n01 = g01.dot(f.sub(vec2(0, 1)));
  const n11 = g11.dot(f.sub(vec2(1, 1)));
  return mix(mix(n00, n10, u.x), mix(n01, n11, u.x), u.y);
});

// Three fixed octaves: 1.0 / 0.5 / 0.25 gains at 1x / 2.04x / 4.11x.
const fbm = Fn(([p]) => {
  const o1 = gradNoise(p);
  const o2 = gradNoise(p.mul(2.04).add(vec2(17.3, 9.1))).mul(0.5);
  const o3 = gradNoise(p.mul(4.11).add(vec2(42.7, 28.6))).mul(0.25);
  return o1.add(o2).add(o3);
});

// Animated detail height field: two counter-drifting FBM layers that provide
// moving capillary-scale chop, sparkle breakup, foam breakup and the clouds.
const detailHeight = Fn(([xz, time]) => {
  const driftA = vec2(time.mul(0.55), time.mul(0.32));
  const driftB = vec2(time.mul(-0.4), time.mul(0.5));
  return fbm(xz.mul(0.85).add(driftA)).add(fbm(xz.mul(2.1).add(driftB)).mul(0.45));
});

// ----------------------------------------------------------------------------
// SECTION 4 · SHARED ANALYTIC SKY
// One skyColor(dir) function feeds BOTH the sky dome and the ocean
// reflections: gradient sky, below-horizon haze, sun halo + disc and a low
// procedural cloud band — all driven by the shared atmosphere uniforms.
// ----------------------------------------------------------------------------

const skyColor = Fn(([dir]) => {
  const d = normalize(dir);
  const up = clamp(d.y, -0.15, 1); // clamped so the pow() never sees negatives
  let col = mix(uHorizonColor, uZenithColor, pow(max(up, 0), 0.42));

  // haze that swallows everything below the horizon line
  col = mix(col, uDeepColor.mul(1.4).add(uHorizonColor.mul(0.25)), smoothstep(0, -0.15, d.y));

  // sun: wide atmospheric halo + small intense disc
  const s = max(dot(d, uSunDir), 0);
  col = col.add(uSunColor.mul(pow(s, 10)).mul(0.18));
  col = col.add(uSunColor.mul(smoothstep(0.9994, 0.9998, s)).mul(30));

  // low, slow cloud band: ray-plane projection so the layer hugs the horizon
  const band = smoothstep(0.03, 0.16, d.y).mul(smoothstep(0.6, 0.22, d.y));
  const proj = d.xz.div(d.y.add(0.18)).mul(0.55);
  const cloudNoise = clamp(fbm(proj.add(vec2(uTime.mul(0.006), uTime.mul(0.003)))).mul(0.5).add(0.5), 0, 1);
  const cover = band.mul(smoothstep(0.62, 0.95, cloudNoise));
  const cloudColor = mix(vec3(0.92, 0.90, 0.87), uSunColor.mul(0.5), 0.45); // warm pale clouds
  col = mix(col, cloudColor, cover.mul(0.6));

  return col;
});

// ----------------------------------------------------------------------------
// SECTION 5 · OCEAN MATERIAL
// MeshBasicNodeMaterial with every apparent light hand-built in the colorNode:
// analytic swell normal + FBM detail normal, deep/shallow water grading,
// Fresnel sky reflection, backlit crest glow, sparkle + gloss sun specular,
// crest foam and a distance haze that hides the finite plane edge.
// ----------------------------------------------------------------------------

const oceanColor = Fn(() => {
  const P = positionWorld;
  const xz = P.xz; // surface coordinates
  const time = uTime;
  const sea = uSea;

  // large-scale analytic swell normal
  const N0 = waveNormal(xz, time, sea);

  // finite-difference FBM detail normal (capillary chop, geometry untouched)
  const e = float(0.1);
  const h0 = detailHeight(xz, time);
  const hx = detailHeight(xz.add(vec2(e, 0)), time);
  const hz = detailHeight(xz.add(vec2(0, e)), time);
  const detailScale = float(1.5).mul(sea.mul(0.6).add(0.4));
  const N = normalize(N0.add(vec3(h0.sub(hx), 0, h0.sub(hz)).mul(detailScale)));

  // view direction + signed crest height
  const V = normalize(cameraPosition.sub(P));
  const crest = waveCrest(xz, time, sea);

  // base water color: crests push the grade toward shallow, troughs toward deep
  let col = mix(uDeepColor, uShallowColor, clamp(crest.mul(0.35).add(0.45), 0, 1));

  // backlit crest glow (fake subsurface scattering), tinted by shallow + sun
  const sss = pow(max(dot(V, uSunDir), 0), 3).mul(max(crest, 0)).mul(0.18);
  col = col.add(uShallowColor.mul(uSunColor).mul(sss));

  // sky reflection through the same analytic sky as the dome
  const R = reflect(V.negate(), N).toVar();
  R.y.assign(max(R.y, 0.04)); // keep reflections above the ground plane
  const reflectedSky = skyColor(R.normalize());

  // Schlick Fresnel: grazing angles reflect the sky, steep views see water
  const fresnel = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(N, V), 0)), 5)));
  col = mix(col, reflectedSky, fresnel);

  // sun specular: tight noise-modulated sparkle + broad gloss
  const H = normalize(uSunDir.add(V));
  const ndh = max(dot(N, H), 0);
  const sparkleNoise = clamp(fbm(xz.mul(0.3).add(vec2(time.mul(-0.07), time.mul(0.05)))).mul(0.5).add(0.5), 0, 1);
  const sparkle = pow(ndh, 500).mul(mix(0.4, 3.4, sparkleNoise)); // gain 0.4..3.4
  const gloss = pow(ndh, 48).mul(0.12);
  col = col.add(uSunColor.mul(sparkle.add(gloss)));

  // crest foam: FBM threshold gated by a crest-height mask
  const foamNoise = clamp(fbm(xz.mul(1.1).add(vec2(time.mul(0.22), time.mul(0.14)))).mul(0.5).add(0.5), 0, 1);
  const foamPatch = smoothstep(0.5, 0.95, foamNoise);
  const foamCrest = smoothstep(1.0, 2.0, crest);
  const foamAmount = foamPatch.mul(foamCrest).mul(0.85); // max strength 0.85
  col = mix(col, vec3(0.82, 0.88, 0.90), foamAmount);

  // horizon haze: fades the water into the horizon color well before the
  // 420-unit plane edge can ever be resolved from the allowed camera range
  const horizonFade = smoothstep(150, 290, distance(P, cameraPosition));
  col = mix(col, uHorizonColor, horizonFade);

  return vec4(col, 1);
});

// ----------------------------------------------------------------------------
// SECTION 6 · TIME OF DAY (CPU palettes)
// DUSK <-> DAY interpolation driven by the normalized slider value t.
// ----------------------------------------------------------------------------

const DAY = {
  zenith: [0.07, 0.20, 0.42],
  horizon: [0.52, 0.68, 0.82],
  sun: [1.0, 0.93, 0.80],
  sunIntensity: 1.6,
  deep: [0.015, 0.09, 0.11],
  shallow: [0.06, 0.32, 0.36],
};

const DUSK = {
  zenith: [0.03, 0.05, 0.16],
  horizon: [0.85, 0.36, 0.16],
  sun: [1.0, 0.42, 0.14],
  sunIntensity: 2.6,
  deep: [0.02, 0.045, 0.075],
  shallow: [0.09, 0.15, 0.20],
};

const lerp = (a, b, t) => a + (b - a) * t;

// cubic smoothstep on [a, b]
const smoothstep01 = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const mixRGB = (target, dusk, day, t) => {
  target.set(
    lerp(dusk[0], day[0], t),
    lerp(dusk[1], day[1], t),
    lerp(dusk[2], day[2], t)
  );
};

function timeOfDayLabel(t) {
  if (t < 0.12) return '黄昏';
  if (t < 0.30) return '金色时刻';
  if (t < 0.62) return '下午';
  return '正午';
}

function applyTimeOfDay(t) {
  const elevation = lerp(-0.05, 0.62, t);
  const azimuth = lerp(-0.9, 0.9, t);
  const ce = Math.cos(elevation);
  const se = Math.sin(elevation);
  const sa = Math.sin(azimuth);
  const ca = Math.cos(azimuth);
  uSunDir.value.set(ce * sa, se, -ce * ca);

  // daylight weight rises from 0 to 1 as the sun climbs to 0.42 rad
  const daylight = smoothstep01(0.0, 0.42, elevation);

  mixRGB(uZenithColor.value, DUSK.zenith, DAY.zenith, daylight);
  mixRGB(uHorizonColor.value, DUSK.horizon, DAY.horizon, daylight);
  mixRGB(uDeepColor.value, DUSK.deep, DAY.deep, daylight);
  mixRGB(uShallowColor.value, DUSK.shallow, DAY.shallow, daylight);

  // sun: intensity is interpolated and then multiplied into the RGB
  const intensity = lerp(2.6, 1.6, daylight);
  uSunColor.value.set(
    lerp(DUSK.sun[0], DAY.sun[0], daylight) * intensity,
    lerp(DUSK.sun[1], DAY.sun[1], daylight) * intensity,
    lerp(DUSK.sun[2], DAY.sun[2], daylight) * intensity
  );
}

// ----------------------------------------------------------------------------
// SECTION 7 · DOM REFERENCES
// ----------------------------------------------------------------------------

const loader = document.getElementById('loader');
const loaderTitle = document.getElementById('loader-title');
const loaderStatus = document.getElementById('loader-status');
const loaderNote = document.getElementById('loader-note');
const ui = document.getElementById('ui');
const seaSlider = document.getElementById('sea-state');
const seaValue = document.getElementById('sea-state-value');
const timeSlider = document.getElementById('time-of-day');
const timeLabel = document.getElementById('time-label');
const driftButton = document.getElementById('drift');
const fpsReadout = document.getElementById('fps');

// ----------------------------------------------------------------------------
// SECTION 8 · LOADING / ERROR STATES
// ----------------------------------------------------------------------------

function showUnavailable() {
  loader.classList.add('error');
  loaderTitle.textContent = 'WEBGPU 不可用';
  loaderStatus.textContent = '当前浏览器不支持 WEBGPU';
  loaderNote.hidden = false;
  loaderNote.textContent = 'Open Sea 需要 WebGPU。请使用支持 WebGPU 的最新版 Chrome 或 Edge，并开启硬件加速后重新加载本页。';
}

function showInitError(err) {
  console.error('[OPEN SEA] initialization failed:', err);
  loader.classList.add('error');
  loaderTitle.textContent = '初始化失败';
  loaderStatus.textContent = err && err.message ? err.message : String(err);
  loaderNote.hidden = false;
  loaderNote.textContent = '请确认已开启硬件加速，并尝试最新版 Chrome 或 Edge。详细错误已输出到控制台。';
}

function revealUI() {
  loader.classList.add('done');
  ui.classList.add('visible');
}

// ----------------------------------------------------------------------------
// SECTION 9 · BOOTSTRAP — renderer, scene, post-processing, controls, loop
// ----------------------------------------------------------------------------

// module-level handles used by the animation loop and event handlers
let renderer = null;
let postProcessing = null;
let controls = null;
let lastFrameTime = performance.now();
let fpsFrames = 0;
let fpsWindow = 0;
let firstFrameShown = false;
let loopStarted = false;

function animate(now) {
  // high-resolution timestamp -> delta, clamped so hitches never cause jumps
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  uTime.value += dt;
  controls.update();
  postProcessing.render();

  // rolling FPS, refreshed twice a second
  fpsFrames += 1;
  fpsWindow += dt;
  if (fpsWindow >= 0.5) {
    const fps = Math.round(fpsFrames / fpsWindow);
    fpsReadout.textContent = String(fps).padStart(2, '0') + ' FPS';
    fpsFrames = 0;
    fpsWindow = 0;
  }

  // the loader disappears only after the first successfully rendered frame
  if (!firstFrameShown) {
    firstFrameShown = true;
    revealUI();
  }
}

async function boot() {
  // WebGPU is a hard requirement — never fall back to WebGL
  if (!navigator.gpu) {
    showUnavailable();
    return;
  }

  try {
    // --- renderer (antialiased, high-performance adapter) -----------------
    renderer = new THREE.WebGPURenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    // --- scene & camera ----------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a); // safe init color

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 8000);
    camera.position.set(0, 5.5, 17);

    // --- ocean --------------------------------------------------------------
    // The plane is rotated -PI/2 about X at build time (baked into the
    // geometry), so local x/z ARE the horizontal surface axes and local +y
    // is world UP: positionLocal.xz feeds straight into the wave functions.
    const oceanGeometry = new THREE.PlaneGeometry(420, 420, 440, 440);
    oceanGeometry.rotateX(-Math.PI / 2);

    const oceanMaterial = new THREE.MeshBasicNodeMaterial();
    oceanMaterial.positionNode = wavePosition(positionLocal.xz, uTime, uSea);
    oceanMaterial.colorNode = oceanColor();

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.frustumCulled = false; // vertex displacement must never cull the mesh
    scene.add(ocean);

    // --- sky dome (same analytic sky, drawn first, depth-write off) --------
    const skyMaterial = new THREE.MeshBasicNodeMaterial();
    skyMaterial.colorNode = skyColor(normalize(positionWorld));
    skyMaterial.side = THREE.BackSide;
    skyMaterial.depthWrite = false;

    const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), skyMaterial);
    sky.renderOrder = -1;
    sky.frustumCulled = false;
    scene.add(sky);

    // --- post-processing: scene pass + TSL bloom ----------------------------
    postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    const sceneColor = scenePass.getTextureNode('output');
    postProcessing.outputNode = sceneColor.add(bloom(sceneColor, 0.4, 0.3, 0.9));

    // --- orbit controls -----------------------------------------------------
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 120;
    controls.minPolarAngle = 0.15;               // never below the surface
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 1.5, 0);
    controls.autoRotate = true;                  // slow ambient drift
    controls.autoRotateSpeed = 0.25;
    controls.update();

    // --- UI bindings (plain DOM, uniforms only — nothing is rebuilt) --------
    const onSeaInput = () => {
      const v = Number(seaSlider.value);
      seaValue.textContent = String(v).padStart(2, '0');
      uSea.value = 0.25 + (v / 100) * 1.5;
    };
    const onTimeInput = () => {
      applyTimeOfDay(Number(timeSlider.value) / 100);
      timeLabel.textContent = timeOfDayLabel(Number(timeSlider.value) / 100);
    };
    seaSlider.addEventListener('input', onSeaInput);
    timeSlider.addEventListener('input', onTimeInput);
    driftButton.addEventListener('click', () => {
      controls.autoRotate = !controls.autoRotate;
      driftButton.classList.toggle('active', controls.autoRotate);
      driftButton.setAttribute('aria-pressed', controls.autoRotate ? 'true' : 'false');
    });
    onSeaInput();
    onTimeInput(); // t = 0.55 -> AFTERNOON palette

    // --- lifecycle: resize ---------------------------------------------------
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- lifecycle: pause when the tab is hidden -------------------------------
    document.addEventListener('visibilitychange', () => {
      if (!loopStarted) return;
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        lastFrameTime = performance.now(); // no time jump on resume
        renderer.setAnimationLoop(animate);
      }
    });

    // --- initialize the GPU and start rendering --------------------------------
    await renderer.init();

    // r178 can silently downgrade to a WebGL2 backend — refuse that.
    if (renderer.backend.isWebGPUBackend !== true) {
      throw new Error('WebGPU device could not be created (WebGL fallback is not allowed).');
    }

    loopStarted = true;
    renderer.setAnimationLoop(animate);
  } catch (err) {
    showInitError(err);
  }
}

boot();
