// ============================================================================
//  OPEN SEA — optimized ocean engine (extension skin edition)
//  WebGPU · Three.js 0.178 · TSL node shaders
//
//  Same visual language as the standalone site, re-tuned for a persistent
//  background: 3x lighter geometry, adaptive resolution, 60 fps frame cap,
//  distance-gated fragment work, no MSAA, low-power adapter in skin mode.
//
//  Runs in two modes:
//    - full page showcase: panel, sliders, loader, error states
//    - skin mode (?skin=1): bare ocean behind the host UI, auto time-of-day
// ============================================================================

import * as THREE from './vendor/three.webgpu.js';
import {
  Fn, pass, uniform, float, vec2, vec3, vec4, If,
  sin, cos, dot, cross, normalize, mix, pow, max, clamp, fract, floor,
  smoothstep, distance, reflect,
  positionLocal, positionWorld, cameraPosition
} from './vendor/three.tsl.js';
import { OrbitControls } from './vendor/addons/controls/OrbitControls.js';
import { bloom } from './vendor/addons/tsl/display/BloomNode.js';

// skin mode: bare background, auto time-of-day, low-power, no UI chrome
const SKIN = new URL(import.meta.url).searchParams.get('skin') === '1';
// skin prefs come from the page query (set by the host content script) and
// live updates arrive via postMessage from the injected settings panel.
const SKIN_QUERY = new URLSearchParams(location.search);
const SKIN_SEA = SKIN_QUERY.has('sea') ? Number(SKIN_QUERY.get('sea')) : null;
const SKIN_TIME = SKIN_QUERY.has('t') ? Number(SKIN_QUERY.get('t')) : null;
const SKIN_PARENT_ORIGIN = SKIN_QUERY.get('parentOrigin');
let manualTimeOfDay = SKIN_QUERY.get('auto') === '0';
let currentDaylight = SKIN_TIME !== null ? SKIN_TIME : 55;

const REDUCED_MOTION = typeof matchMedia === 'function'
  && matchMedia('(prefers-reduced-motion: reduce)').matches;
const QUALITY = SKIN_QUERY.get('quality') || 'auto';
const LOW_END_DEVICE = QUALITY === 'low' || (QUALITY === 'auto' && (
  (navigator.hardwareConcurrency || 8) <= 4
  || ('deviceMemory' in navigator && Number(navigator.deviceMemory) <= 4)
));

// ----------------------------------------------------------------------------
// SECTION 1 · SHARED UNIFORMS
// ----------------------------------------------------------------------------

const uTime = uniform(0);
const uSea = uniform(0.25 + (45 / 100) * 1.5);
const uSunDir = uniform(new THREE.Vector3(0, 0.5, -0.87));
const uSunColor = uniform(new THREE.Vector3(1, 1, 1));
const uHorizonColor = uniform(new THREE.Vector3(1, 1, 1));
const uZenithColor = uniform(new THREE.Vector3(1, 1, 1));
const uDeepColor = uniform(new THREE.Vector3(1, 1, 1));
const uShallowColor = uniform(new THREE.Vector3(1, 1, 1));

// ----------------------------------------------------------------------------
// SECTION 2 · GERSTNER SWELL (identical to the standalone site)
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
  const k = (Math.PI * 2) / w.wavelength;
  const c = Math.sqrt(9.8 * k);
  return { dx, dy, k, c, a0: w.steepness / k };
});

const wavePosition = Fn(([xz, time, sea]) => {
  let x = xz.x;
  let y = float(0);
  let z = xz.y;
  for (const w of GERSTNER_DEFS) {
    const dir = vec2(w.dx, w.dy);
    const f = float(w.k).mul(dir.dot(xz).sub(time.mul(float(w.c))));
    const a = float(w.a0).mul(sea);
    x = x.add(a.mul(dir.x).mul(cos(f)));
    y = y.add(a.mul(sin(f)));
    z = z.add(a.mul(dir.y).mul(cos(f)));
  }
  return vec3(x, y, z);
});

const waveNormal = Fn(([xz, time, sea]) => {
  let tx = float(1), ty = float(0), tz = float(0);
  let bx = float(0), by = float(0), bz = float(1);
  for (const w of GERSTNER_DEFS) {
    const dir = vec2(w.dx, w.dy);
    const f = float(w.k).mul(dir.dot(xz).sub(time.mul(float(w.c))));
    const a = float(w.a0).mul(sea);
    const s = sin(f);
    const co = cos(f);
    const ak = a.mul(float(w.k));
    const aks = ak.mul(s);
    const akc = ak.mul(co);
    tx = tx.sub(aks.mul(dir.x).mul(dir.x));
    ty = ty.add(akc.mul(dir.x));
    tz = tz.sub(aks.mul(dir.x).mul(dir.y));
    bx = bx.sub(aks.mul(dir.x).mul(dir.y));
    by = by.add(akc.mul(dir.y));
    bz = bz.sub(aks.mul(dir.y).mul(dir.y));
  }
  return normalize(cross(vec3(bx, by, bz), vec3(tx, ty, tz)));
});

const waveCrest = Fn(([xz, time, sea]) => {
  let crest = float(0);
  for (const w of GERSTNER_DEFS) {
    const f = float(w.k).mul(vec2(w.dx, w.dy).dot(xz).sub(time.mul(float(w.c))));
    crest = crest.add(float(w.a0).mul(sea).mul(sin(f)));
  }
  return crest;
});

// ----------------------------------------------------------------------------
// SECTION 3 · PROCEDURAL GRADIENT NOISE + FBM (identical to the standalone)
// ----------------------------------------------------------------------------

const hash2 = Fn(([p]) => {
  // Keep the sine input in a compact range. Large dot products lose enough
  // float precision for the far field to band on some integrated GPUs.
  const q = p.sub(floor(p.div(289)).mul(289));
  const a = sin(q.dot(vec2(127.1, 311.7))).mul(43758.5453);
  const b = sin(q.dot(vec2(269.5, 183.3))).mul(43758.5453);
  return vec2(fract(a).mul(2).sub(1), fract(b).mul(2).sub(1));
});

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

const fbm = Fn(([p]) => {
  const o1 = gradNoise(p);
  const o2 = gradNoise(p.mul(2.04).add(vec2(17.3, 9.1))).mul(0.5);
  const o3 = gradNoise(p.mul(4.11).add(vec2(42.7, 28.6))).mul(0.25);
  return o1.add(o2).add(o3);
});

const detailHeight = Fn(([xz, time]) => {
  const driftA = vec2(time.mul(0.55), time.mul(0.32));
  const driftB = vec2(time.mul(-0.4), time.mul(0.5));
  return fbm(xz.mul(0.85).add(driftA)).add(fbm(xz.mul(2.1).add(driftB)).mul(0.45));
});

// ----------------------------------------------------------------------------
// SECTION 4 · SHARED ANALYTIC SKY
// cloudMask gates the cloud FBM: the dome always passes 1, the ocean only
// pays for cloud noise where the reflection is actually visible.
// ----------------------------------------------------------------------------

const skyColor = Fn(([dir, cloudMask]) => {
  const d = normalize(dir);
  const up = clamp(d.y, -0.15, 1);
  const col = mix(uHorizonColor, uZenithColor, pow(max(up, 0), 0.42)).toVar();

  col.assign(mix(col, uDeepColor.mul(1.4).add(uHorizonColor.mul(0.25)), smoothstep(0, -0.15, d.y)));

  const s = max(dot(d, uSunDir), 0);
  col.addAssign(uSunColor.mul(pow(s, 10)).mul(0.18));
  col.addAssign(uSunColor.mul(smoothstep(0.9994, 0.9998, s)).mul(30));

  // clouds only inside the low band: skips one FBM for most sky pixels
  const band = smoothstep(0.03, 0.16, d.y).mul(smoothstep(0.6, 0.22, d.y));
  If(band.mul(cloudMask).greaterThan(0.001), () => {
    const proj = d.xz.div(d.y.add(0.18)).mul(0.55);
    const cloudNoise = clamp(fbm(proj.add(vec2(uTime.mul(0.006), uTime.mul(0.003)))).mul(0.5).add(0.5), 0, 1);
    const cover = band.mul(smoothstep(0.62, 0.95, cloudNoise));
    const cloudColor = mix(vec3(0.92, 0.90, 0.87), uSunColor.mul(0.5), 0.45);
    col.assign(mix(col, cloudColor, cover.mul(0.6)));
  });

  return col;
});

// ----------------------------------------------------------------------------
// SECTION 5 · OCEAN MATERIAL
// ECO: the FBM detail normal, sparkle and foam (4 FBM = 12 gradient-noise
// evaluations per pixel) only run within 140 units of the camera — beyond
// that the horizon haze dissolves them anyway. Swell shading stays analytic.
// ----------------------------------------------------------------------------

const DETAIL_RADIUS = 140;

const oceanColor = Fn(() => {
  const P = positionWorld;
  const xz = P.xz;
  const time = uTime;
  const sea = uSea;
  const dist = distance(P, cameraPosition);

  const N0 = waveNormal(xz, time, sea);
  const N = N0.toVar();
  const crest = waveCrest(xz, time, sea);
  const V = normalize(cameraPosition.sub(P));

  const spec = vec3(0).toVar();
  const foam = float(0).toVar();

  If(dist.lessThan(DETAIL_RADIUS), () => {
    // finite-difference FBM detail normal (capillary chop)
    const e = float(0.1);
    const h0 = detailHeight(xz, time);
    const hx = detailHeight(xz.add(vec2(e, 0)), time);
    const hz = detailHeight(xz.add(vec2(0, e)), time);
    const detailScale = float(1.5).mul(sea.mul(0.6).add(0.4));
    N.assign(normalize(N.add(vec3(h0.sub(hx), 0, h0.sub(hz)).mul(detailScale))));

    // sun specular: tight noise-modulated sparkle + broad gloss
    const H = normalize(uSunDir.add(V));
    const ndh = max(dot(N, H), 0);
    const sparkleNoise = clamp(fbm(xz.mul(0.3).add(vec2(time.mul(-0.07), time.mul(0.05)))).mul(0.5).add(0.5), 0, 1);
    spec.assign(uSunColor.mul(pow(ndh, 500).mul(mix(0.4, 3.4, sparkleNoise)).add(pow(ndh, 48).mul(0.12))));

    // crest foam
    const foamNoise = clamp(fbm(xz.mul(1.1).add(vec2(time.mul(0.22), time.mul(0.14)))).mul(0.5).add(0.5), 0, 1);
    foam.assign(smoothstep(0.5, 0.95, foamNoise).mul(smoothstep(1.0, 2.0, crest)).mul(0.85));
  });

  // base water color + backlit crest glow
  const col = mix(uDeepColor, uShallowColor, clamp(crest.mul(0.35).add(0.45), 0, 1)).toVar();
  const sss = pow(max(dot(V, uSunDir), 0), 3).mul(max(crest, 0)).mul(0.18);
  col.addAssign(uShallowColor.mul(uSunColor).mul(sss));

  // sky reflection (cloud FBM only where the reflection matters)
  const R = reflect(V.negate(), N).toVar();
  R.y.assign(max(R.y, 0.04));
  const fresnel = float(0.02).add(float(0.98).mul(pow(float(1).sub(max(dot(N, V), 0)), 5)));
  col.assign(mix(col, skyColor(R.normalize(), fresnel.greaterThan(0.25)), fresnel));

  col.addAssign(spec);
  col.assign(mix(col, vec3(0.82, 0.88, 0.90), foam));

  const horizonFade = smoothstep(150, 290, dist);
  col.assign(mix(col, uHorizonColor, horizonFade));

  return vec4(col, 1);
});

// ----------------------------------------------------------------------------
// SECTION 6 · TIME OF DAY (CPU palettes)
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
const smoothstep01 = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mixRGB = (target, dusk, day, t) => {
  target.set(lerp(dusk[0], day[0], t), lerp(dusk[1], day[1], t), lerp(dusk[2], day[2], t));
};

function timeOfDayLabel(t) {
  if (t < 0.12) return 'DUSK';
  if (t < 0.30) return 'GOLDEN HOUR';
  if (t < 0.62) return 'AFTERNOON';
  return 'MIDDAY';
}

function applyTimeOfDay(t) {
  currentDaylight = Math.min(100, Math.max(0, t * 100));
  const elevation = lerp(-0.05, 0.62, t);
  const azimuth = lerp(-0.9, 0.9, t);
  const ce = Math.cos(elevation);
  const se = Math.sin(elevation);
  const sa = Math.sin(azimuth);
  const ca = Math.cos(azimuth);
  uSunDir.value.set(ce * sa, se, -ce * ca);

  const daylight = smoothstep01(0.0, 0.42, elevation);

  mixRGB(uZenithColor.value, DUSK.zenith, DAY.zenith, daylight);
  mixRGB(uHorizonColor.value, DUSK.horizon, DAY.horizon, daylight);
  mixRGB(uDeepColor.value, DUSK.deep, DAY.deep, daylight);
  mixRGB(uShallowColor.value, DUSK.shallow, DAY.shallow, daylight);

  const intensity = lerp(2.6, 1.6, daylight);
  uSunColor.value.set(
    lerp(DUSK.sun[0], DAY.sun[0], daylight) * intensity,
    lerp(DUSK.sun[1], DAY.sun[1], daylight) * intensity,
    lerp(DUSK.sun[2], DAY.sun[2], daylight) * intensity
  );
}

// ----------------------------------------------------------------------------
// SECTION 7 · DOM REFERENCES (absent in skin mode)
// ----------------------------------------------------------------------------

const $ = (id) => document.getElementById(id);
const loader = $('loader');
const loaderTitle = $('loader-title');
const loaderStatus = $('loader-status');
const loaderNote = $('loader-note');
const ui = $('ui');
const seaSlider = $('sea-state');
const seaValue = $('sea-state-value');
const timeSlider = $('time-of-day');
const timeLabel = $('time-label');
const driftButton = $('drift');
const fpsReadout = $('fps');

// ----------------------------------------------------------------------------
// SECTION 8 · LOADING / ERROR STATES
// ----------------------------------------------------------------------------

function showUnavailable() {
  if (!loader) {
    console.error('[OPEN SEA SKIN] WebGPU is not available in this browser.');
    return;
  }
  loader.classList.add('error');
  loaderTitle.textContent = 'WEBGPU UNAVAILABLE';
  loaderStatus.textContent = 'WEBGPU IS NOT AVAILABLE IN THIS BROWSER';
  loaderNote.hidden = false;
  loaderNote.textContent = 'Open Sea requires WebGPU. Please use a recent version of Chrome or Edge with hardware acceleration enabled, then reload the page.';
}

function showInitError(err) {
  console.error('[OPEN SEA SKIN] initialization failed:', err);
  if (!loader) return;
  loader.classList.add('error');
  loaderTitle.textContent = 'INITIALIZATION FAILED';
  loaderStatus.textContent = err && err.message ? err.message : String(err);
  loaderNote.hidden = false;
  loaderNote.textContent = 'Make sure hardware acceleration is enabled and try the latest Chrome or Edge. Details were logged to the console.';
}

function revealUI() {
  if (loader) loader.classList.add('done');
  if (ui) ui.classList.add('visible');
  document.body.classList.add('ready'); // skin mode: fades the ocean in
}

// skin controls: the host page sends 波浪大小/日光 adjustments here
if (SKIN) {
  window.addEventListener('message', (ev) => {
    if (ev.source !== window.parent) return;
    if (SKIN_PARENT_ORIGIN && ev.origin !== SKIN_PARENT_ORIGIN) return;
    const d = ev.data;
    if (d && d.type === 'oss-set') {
      manualTimeOfDay = d.auto !== true;
      const sea = Number(d.sea);
      const t = Number(d.t);
      if (Number.isFinite(sea) && sea >= 0 && sea <= 100) {
        uSea.value = 0.25 + (sea / 100) * 1.5;
      }
      if (Number.isFinite(t) && t >= 0 && t <= 100) {
        applyTimeOfDay(t / 100);
      }
    }
  });
  // tiny debug hook for automated checks
  window.__ossState = () => ({
    sea: uSea.value,
    daylight: currentDaylight,
    elapsed: uTime.value,
    manualTimeOfDay,
    renderScale,
    reducedMotion: REDUCED_MOTION,
    lowEndDevice: LOW_END_DEVICE,
  });
}

// ----------------------------------------------------------------------------
// SECTION 9 · BOOTSTRAP — renderer, scene, post-processing, controls, loop
// ECO tuning: lighter mesh, no MSAA (inert under PostProcessing anyway),
// capped pixel ratio with adaptive scale, 60 fps frame cap, low-power
// adapter in skin mode, and everything still pauses when the tab hides.
// ----------------------------------------------------------------------------

let renderer = null;
let postProcessing = null;
let controls = null;
let lastFrameTime = performance.now();
let lastRenderAt = 0;
let fpsFrames = 0;
let fpsWindow = 0;
let adaptWindow = 0;
let fpsNow = 0;
let fpsStamp = performance.now();
let adaptStamp = performance.now();
let skinTimeWindow = 0;
let firstFrameShown = false;
let loopStarted = false;

const PIXEL_RATIO_CAP = REDUCED_MOTION ? 0.9 : LOW_END_DEVICE ? 1.0 : 1.5;
const BASE_PIXEL_RATIO = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP);
const FRAME_RATE_CAP = REDUCED_MOTION ? 20 : LOW_END_DEVICE ? 30 : 60;
const FRAME_MS = 1000 / FRAME_RATE_CAP;
const TARGET_FPS = REDUCED_MOTION ? 18 : LOW_END_DEVICE ? 28 : SKIN ? 40 : 55;
const MIN_SCALE = REDUCED_MOTION ? 0.5 : SKIN ? 0.5 : 0.55;
let renderScale = 1;

function applyResolutionScale(scale) {
  renderer.setPixelRatio(BASE_PIXEL_RATIO * scale);
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(now) {
  // high-resolution timestamp -> delta, clamped so hitches never cause jumps
  const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
  lastFrameTime = now;

  uTime.value += dt * (REDUCED_MOTION ? 0.12 : 1);
  controls.update();

  // frame cap: skip work when the display fires faster than 60 Hz
  if (now - lastRenderAt < FRAME_MS - 0.5) return;
  lastRenderAt = now;

  postProcessing.render();

  // rolling FPS + adaptive resolution (rechecked every 2 s)
  // wall-clock windows: skipped frames must not shrink the meter's time base
  fpsFrames += 1;
  fpsWindow += (now - fpsStamp) / 1000;
  fpsStamp = now;
  adaptWindow += (now - adaptStamp) / 1000;
  adaptStamp = now;
  if (fpsWindow >= 0.5) {
    fpsNow = fpsFrames / fpsWindow;
    fpsFrames = 0;
    fpsWindow = 0;
    if (fpsReadout) fpsReadout.textContent = String(Math.round(fpsNow)).padStart(2, '0') + ' FPS';
  }
  if (adaptWindow >= 2) {
    adaptWindow = 0;
    if (fpsNow > 0) {
      if (fpsNow < TARGET_FPS - 8 && renderScale > MIN_SCALE) {
        renderScale = Math.max(MIN_SCALE, +(renderScale * 0.92).toFixed(3));
        applyResolutionScale(renderScale);
      } else if (fpsNow > TARGET_FPS + 8 && renderScale < 1) {
        renderScale = Math.min(1, +(renderScale * 1.06).toFixed(3));
        applyResolutionScale(renderScale);
      }
    }
  }

  // skin mode: slowly cycle the whole day so the background keeps evolving
  // (only while the user hasn't pinned 日光 from the injected panel)
  if (SKIN && !manualTimeOfDay) {
    skinTimeWindow += dt;
    if (skinTimeWindow >= 0.25) {
      skinTimeWindow = 0;
      // 12-minute day/night cycle
      applyTimeOfDay(0.5 + 0.5 * Math.sin((uTime.value / 720) * Math.PI * 2));
    }
  }

  // the loader disappears only after the first successfully rendered frame
  if (!firstFrameShown) {
    firstFrameShown = true;
    revealUI();
  }
}

async function boot() {
  if (!navigator.gpu) {
    showUnavailable();
    return;
  }

  try {
    // --- renderer (no MSAA; low-power adapter in skin mode) ---------------
    renderer = new THREE.WebGPURenderer({
      antialias: false, // MSAA is inert under the post pipeline — pure savings
      powerPreference: SKIN ? 'low-power' : 'high-performance',
    });
    renderer.setPixelRatio(BASE_PIXEL_RATIO);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.body.appendChild(renderer.domElement);

    // --- scene & camera ----------------------------------------------------
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070a);

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.5, 8000);
    camera.position.set(0, 5.5, 17);

    // --- ocean --------------------------------------------------------------
    // 256x256 segments instead of 440x440: 66k verts vs 194k (~8 MB less
    // VRAM) with no visible difference — fine detail lives in the FBM normals.
    const oceanSegments = LOW_END_DEVICE || REDUCED_MOTION ? 160 : 256;
    const oceanGeometry = new THREE.PlaneGeometry(420, 420, oceanSegments, oceanSegments);
    oceanGeometry.rotateX(-Math.PI / 2);

    const oceanMaterial = new THREE.MeshBasicNodeMaterial();
    oceanMaterial.positionNode = wavePosition(positionLocal.xz, uTime, uSea);
    oceanMaterial.colorNode = oceanColor();

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.frustumCulled = false;
    scene.add(ocean);

    // --- sky dome ------------------------------------------------------------
    const skyMaterial = new THREE.MeshBasicNodeMaterial();
    skyMaterial.colorNode = skyColor(normalize(positionWorld), float(1));
    skyMaterial.side = THREE.BackSide;
    skyMaterial.depthWrite = false;

    const sky = new THREE.Mesh(new THREE.SphereGeometry(
      4000, LOW_END_DEVICE ? 32 : 48, LOW_END_DEVICE ? 16 : 24,
    ), skyMaterial);
    sky.renderOrder = -1;
    sky.frustumCulled = false;
    scene.add(sky);

    // --- post-processing: scene pass + TSL bloom ----------------------------
    postProcessing = new THREE.PostProcessing(renderer);
    const scenePass = pass(scene, camera);
    const sceneColor = scenePass.getTextureNode('output');
    const bloomStrength = SKIN ? (LOW_END_DEVICE ? 0.18 : 0.28) : 0.4;
    postProcessing.outputNode = sceneColor.add(bloom(sceneColor, bloomStrength, 0.3, 0.9));

    // --- orbit controls -----------------------------------------------------
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 120;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 1.5, 0);
    controls.autoRotate = !REDUCED_MOTION;
    controls.autoRotateSpeed = SKIN ? 0.12 : 0.25; // skin: extra-slow ambient drift
    controls.update();

    // --- UI bindings (full-page mode only) ----------------------------------
    if (!SKIN) {
      if (REDUCED_MOTION) {
        driftButton.classList.remove('active');
        driftButton.setAttribute('aria-pressed', 'false');
      }
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
      onTimeInput(); // t = 0.55 -> AFTERNOON
    } else {
      // skin mode: saved 波浪大小/日光 from the host content script
      if (SKIN_SEA !== null) {
        uSea.value = 0.25 + (SKIN_SEA / 100) * 1.5;
      }
      applyTimeOfDay(SKIN_TIME !== null ? SKIN_TIME / 100 : 0.55);
    }

    // --- lifecycle: resize ---------------------------------------------------
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      applyResolutionScale(renderScale);
    });

    // --- lifecycle: pause when the tab is hidden -------------------------------
    document.addEventListener('visibilitychange', () => {
      if (!loopStarted) return;
      if (document.hidden) {
        renderer.setAnimationLoop(null);
      } else {
        lastFrameTime = performance.now();
        lastRenderAt = 0;
        renderer.setAnimationLoop(animate);
      }
    });

    // --- initialize the GPU and start rendering --------------------------------
    await renderer.init();

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
