const translations = {
  zh: {
    skip: '跳到主要内容', navFeatures: '特色', navGallery: '实拍', navInstall: '安装', source: '源代码',
    eyebrow: 'DEEPSEEK HARNESS · 实时海洋皮肤', heroTitle: '让 Harness<br>拥有自己的海平线',
    heroBody: '不是壁纸，而是一片会随你调节的 WebGPU 海洋。拖动右侧控制台，亲手改变波浪、日光与界面通透度。',
    installNow: '立即安装', seeReal: '查看真实 Harness 实拍', localOnly: '资源全本地', noTracking: '零数据收集',
    labTitle: '潮汐实验台', rendererLoading: '正在连接海面', rendererReady: '实时渲染中', rendererFallback: '静态海面模式',
    calm: '平静', sunset: '夕阳', highSea: '高海况', waves: '波浪大小', wavesNote: '从镜面到涌浪',
    daylight: '日光', daylightNote: '正午到黄昏', transparency: '界面通透度', transparencyNote: '让海洋浮现',
    uiMode: '界面模式', dark: '深色', light: '浅色', livePreview: '实时预览', newTask: '新任务', workspace: '工作区',
    settings: '设置', taskTitle: '打造一片可交互的海', modelMode: '标准模式⌄', welcome: '探索未至之境',
    welcomeBody: 'Open Sea 让 DeepSeek Harness 的工作空间随海况与光线呼吸。', composer: '描述你想构建的内容',
    detailsTitle: '当前环境', rendering: '渲染', privacy: '隐私', local: '本地', fps: '帧率', scroll: '继续探索',
    factOne: '只作用于 Harness', factOneBody: '不接管新标签页', factTwo: '五组 Gerstner 波', factThree: '自适应性能',
    factFour: '可逆安装', factFourBody: '三种安装方式', featuresTitle: '一片真正属于<br>工作流的海',
    featuresBody: '它不是覆盖在界面上的视频。海面、天空、太阳和反射由 GPU 实时生成，控制变化会立刻反馈到你的工作空间。',
    featureLive: '实时，而非循环素材', featureLiveBody: '五组 Gerstner 涌浪、解析法线、FBM 微表面、浪尖泡沫与 Fresnel 天空反射，共享同一组日光参数。',
    featureHarness: '为 Harness 而生', featureHarnessBody: '左下角快捷控制、设置页原生入口、对话框层级修复，以及只识别真正 Harness 页面的浏览器扩展。',
    featureQuiet: '安静地运行', featureQuietBody: '隐藏标签页自动暂停，动态分辨率和低端设备降级，让海洋成为氛围，而不是负担。',
    featureLocal: '没有遥测，也没有远程代码', featureLocalBody: 'three.js、TSL、字体和全部着色器随包本地提供。扩展只请求本机 Harness 地址与设置存储权限。',
    galleryTitle: '来自真实 Harness<br>的海况记录', galleryBody: '以下全部在 DeepSeek Harness 中录制，玻璃不透明度统一为 40%。不是概念图，也不是后期合成。',
    galleryDark: '深色全景', galleryLight: '浅色全景', galleryWaves: '调节波浪', gallerySunset: '从白天到夕阳',
    installTitle: '把海带回<br>你的 Harness', installBody: '推荐使用 DSH 插件安装；浏览器扩展适合不修改 Harness 的用户，静态安装器用于打包环境。',
    recommended: '推荐', dshBody: '一行命令安装完整本地运行时与左下角快捷控制。', restart: '安装后重新启动 dsh web',
    browserExtension: '浏览器扩展', browserBody: '只为经过识别的 Harness 页面换肤，不会接管新标签页或影响其他本地网站。',
    downloadZip: '下载 v1.2.1 ZIP', oneCommand: '一键静态安装', staticBody: '从任意目录运行；自动备份、可重复更新、可安全卸载。',
    copy: '复制命令', copied: '命令已复制', copyFailed: '复制失败，请手动选择命令',
    closingTitle: '工作可以很深，<br>界面不必沉重。', closingBody: 'Open Sea 免费、开源、本地优先。欢迎把它带进你的 Harness，也欢迎一起把这片海做得更好。',
    visitGitHub: '前往 GitHub', viewRelease: '查看最新 Release', privacyPolicy: '隐私', issues: '问题反馈',
    timeDusk: '黄昏', timeGolden: '金色时刻', timeAfternoon: '下午', timeNoon: '正午',
  },
  en: {
    skip: 'Skip to main content', navFeatures: 'Features', navGallery: 'Gallery', navInstall: 'Install', source: 'Source',
    eyebrow: 'DEEPSEEK HARNESS · REALTIME OCEAN SKIN', heroTitle: 'Give Harness<br>its own horizon',
    heroBody: 'Not a wallpaper—a WebGPU ocean that responds to you. Use the live console to shape the waves, daylight, and interface transparency.',
    installNow: 'Install now', seeReal: 'See real Harness captures', localOnly: 'All assets local', noTracking: 'Zero data collection',
    labTitle: 'Tidal laboratory', rendererLoading: 'Connecting ocean', rendererReady: 'Rendering live', rendererFallback: 'Static ocean mode',
    calm: 'Calm', sunset: 'Sunset', highSea: 'High sea', waves: 'Wave size', wavesNote: 'Mirror to swell',
    daylight: 'Daylight', daylightNote: 'Noon to dusk', transparency: 'UI transparency', transparencyNote: 'Reveal the ocean',
    uiMode: 'Interface mode', dark: 'Dark', light: 'Light', livePreview: 'Live preview', newTask: 'New task', workspace: 'Workspace',
    settings: 'Settings', taskTitle: 'Build an interactive sea', modelMode: 'Standard mode⌄', welcome: 'Explore what lies beyond',
    welcomeBody: 'Open Sea lets the DeepSeek Harness workspace breathe with sea state and light.', composer: 'Describe what you want to build',
    detailsTitle: 'Current environment', rendering: 'Rendering', privacy: 'Privacy', local: 'Local', fps: 'Frame rate', scroll: 'Keep exploring',
    factOne: 'Harness only', factOneBody: 'Never replaces New Tab', factTwo: 'Five Gerstner waves', factThree: 'Adaptive performance',
    factFour: 'Reversible install', factFourBody: 'Three install paths', featuresTitle: 'An ocean made<br>for the workflow',
    featuresBody: 'This is not a video behind the interface. The sea, sky, sun, and reflections are generated live on the GPU, so every control responds immediately.',
    featureLive: 'Realtime, never looped footage', featureLiveBody: 'Five Gerstner swells, analytic normals, FBM micro-surface, crest foam, and Fresnel sky reflections share one daylight model.',
    featureHarness: 'Made for Harness', featureHarnessBody: 'Lower-left quick controls, native Settings integration, corrected modal stacking, and a browser extension that recognizes only real Harness pages.',
    featureQuiet: 'Designed to stay quiet', featureQuietBody: 'Hidden-tab pause, adaptive resolution, and low-end fallbacks keep the ocean atmospheric instead of demanding.',
    featureLocal: 'No telemetry. No remote code.', featureLocalBody: 'three.js, TSL, fonts, and every shader ship locally. The extension requests only loopback Harness access and preference storage.',
    galleryTitle: 'Sea-state records<br>from real Harness', galleryBody: 'Every capture below was recorded inside DeepSeek Harness at 40% glass opacity. No concept renders and no compositing.',
    galleryDark: 'Dark overview', galleryLight: 'Light overview', galleryWaves: 'Adjusting waves', gallerySunset: 'Daylight to sunset',
    installTitle: 'Bring the ocean<br>into your Harness', installBody: 'The DSH plugin is recommended. Use the browser extension when you do not want to modify Harness, or the static installer for packaged builds.',
    recommended: 'Recommended', dshBody: 'One command installs the complete local runtime and lower-left quick controls.', restart: 'Restart dsh web after installation',
    browserExtension: 'Browser extension', browserBody: 'Skins verified Harness pages only. It never replaces New Tab or touches other localhost apps.',
    downloadZip: 'Download v1.2.1 ZIP', oneCommand: 'One-command static install', staticBody: 'Run it from any directory, with automatic backup, repeatable updates, and safe uninstall.',
    copy: 'Copy command', copied: 'Command copied', copyFailed: 'Copy failed—select the command manually',
    closingTitle: 'The work can be deep.<br>The interface can feel light.', closingBody: 'Open Sea is free, open source, and local-first. Bring it into your Harness—and help us make this ocean even better.',
    visitGitHub: 'Visit GitHub', viewRelease: 'View latest release', privacyPolicy: 'Privacy', issues: 'Issues',
    timeDusk: 'Dusk', timeGolden: 'Golden hour', timeAfternoon: 'Afternoon', timeNoon: 'Midday',
  },
};

const root = document.documentElement;
const oceanFrame = document.getElementById('ocean-frame');
const seaInput = document.getElementById('sea-state');
const dayInput = document.getElementById('daylight');
const transparencyInput = document.getElementById('transparency');
const seaOutput = document.getElementById('sea-output');
const dayOutput = document.getElementById('day-output');
const transparencyOutput = document.getElementById('transparency-output');
const rendererStatus = document.getElementById('renderer-status');
const rendererStatusText = rendererStatus.querySelector('span');
const languageToggle = document.getElementById('language-toggle');
const copyStatus = document.getElementById('copy-status');

const state = {
  sea: 56,
  daylight: 55,
  transparency: 64,
  theme: 'dark',
  lang: 'zh',
  renderer: 'loading',
};

const presets = {
  calm: { sea: 18, daylight: 58, transparency: 64 },
  sunset: { sea: 44, daylight: 18, transparency: 68 },
  high: { sea: 88, daylight: 46, transparency: 64 },
};

function copy() {
  return translations[state.lang];
}

function timeLabel(value) {
  const text = copy();
  if (value < 12) return text.timeDusk;
  if (value < 30) return text.timeGolden;
  if (value < 64) return text.timeAfternoon;
  return text.timeNoon;
}

function setRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const fill = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--fill', `${fill}%`);
}

function updateOutputs() {
  seaInput.value = String(state.sea);
  dayInput.value = String(state.daylight);
  transparencyInput.value = String(state.transparency);
  seaOutput.textContent = String(state.sea).padStart(2, '0');
  dayOutput.textContent = timeLabel(state.daylight);
  transparencyOutput.textContent = `${state.transparency}%`;
  for (const input of [seaInput, dayInput, transparencyInput]) setRangeFill(input);

  const glassAlpha = Math.min(0.8, Math.max(0.14, (100 - state.transparency) / 100));
  root.style.setProperty('--glass-alpha', glassAlpha.toFixed(2));
  root.style.setProperty('--glass-blur', `${Math.round(18 + state.transparency * 0.12)}px`);

  for (const button of document.querySelectorAll('[data-preset]')) {
    const preset = presets[button.dataset.preset];
    const active = preset.sea === state.sea
      && preset.daylight === state.daylight
      && preset.transparency === state.transparency;
    button.classList.toggle('active', active);
  }
}

function sendOceanState() {
  if (!oceanFrame.contentWindow) return;
  oceanFrame.contentWindow.postMessage({
    type: 'oss-set',
    sea: state.sea,
    t: state.daylight,
    auto: false,
  }, location.origin);
}

function setOceanState(patch) {
  Object.assign(state, patch);
  updateOutputs();
  sendOceanState();
}

function oceanUrl() {
  const query = new URLSearchParams({
    skin: '1',
    sea: String(state.sea),
    t: String(state.daylight),
    auto: '0',
    quality: 'auto',
    parentOrigin: location.origin,
  });
  return `./skin.html?${query}`;
}

function updateRendererStatus(next) {
  state.renderer = next;
  rendererStatus.classList.toggle('ready', next === 'ready');
  rendererStatus.classList.toggle('fallback', next === 'fallback');
  const key = next === 'ready' ? 'rendererReady' : next === 'fallback' ? 'rendererFallback' : 'rendererLoading';
  rendererStatusText.textContent = copy()[key];
}

function probeRenderer() {
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    try {
      const body = oceanFrame.contentDocument?.body;
      if (body?.classList.contains('ready')) {
        window.clearInterval(timer);
        oceanFrame.classList.add('ready');
        updateRendererStatus('ready');
        sendOceanState();
        return;
      }
    } catch {
      // Same-origin GitHub Pages and local previews are expected. Keep the
      // static visual fallback if a host applies an unusual iframe policy.
    }
    if (attempts >= 80) {
      window.clearInterval(timer);
      updateRendererStatus('fallback');
    }
  }, 150);
}

function applyLanguage(lang) {
  state.lang = lang;
  root.lang = lang === 'zh' ? 'zh-CN' : 'en';
  const text = copy();
  for (const element of document.querySelectorAll('[data-i18n]')) {
    const value = text[element.dataset.i18n];
    if (value !== undefined) element.innerHTML = value;
  }
  for (const element of document.querySelectorAll('[data-i18n-aria]')) {
    const value = text[element.dataset.i18nAria];
    if (value !== undefined) element.setAttribute('aria-label', value);
  }
  languageToggle.textContent = lang === 'zh' ? 'EN' : '中文';
  document.title = lang === 'zh'
    ? 'Open Sea · DeepSeek Harness 海洋皮肤'
    : 'Open Sea · Ocean skin for DeepSeek Harness';
  updateOutputs();
  updateRendererStatus(state.renderer);
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  if (!copied) throw new Error('copy failed');
}

for (const input of [seaInput, dayInput, transparencyInput]) {
  input.addEventListener('input', () => {
    setOceanState({
      sea: Number(seaInput.value),
      daylight: Number(dayInput.value),
      transparency: Number(transparencyInput.value),
    });
  });
}

for (const button of document.querySelectorAll('[data-preset]')) {
  button.addEventListener('click', () => setOceanState(presets[button.dataset.preset]));
}

for (const button of document.querySelectorAll('[data-theme-choice]')) {
  button.addEventListener('click', () => {
    state.theme = button.dataset.themeChoice;
    root.dataset.uiTheme = state.theme;
    for (const candidate of document.querySelectorAll('[data-theme-choice]')) {
      candidate.classList.toggle('active', candidate === button);
    }
  });
}

languageToggle.addEventListener('click', () => applyLanguage(state.lang === 'zh' ? 'en' : 'zh'));

for (const button of document.querySelectorAll('[data-copy]')) {
  button.addEventListener('click', async () => {
    try {
      await copyText(button.dataset.copy);
      copyStatus.textContent = copy().copied;
      const previous = button.textContent;
      button.textContent = '✓';
      window.setTimeout(() => { button.textContent = previous; }, 1400);
    } catch {
      copyStatus.textContent = copy().copyFailed;
    }
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  }
}, { threshold: 0.14, rootMargin: '0px 0px -40px' });

for (const element of document.querySelectorAll('.reveal')) revealObserver.observe(element);

updateOutputs();
oceanFrame.src = oceanUrl();
oceanFrame.addEventListener('load', () => {
  sendOceanState();
  probeRenderer();
}, { once: true });
