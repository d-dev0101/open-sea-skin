// GENERATED from shared/skin-core.js. Run npm run build after editing shared sources.
// Open Sea Skin shared host-page controller.
//
// This file intentionally has no import/export statements: the release build
// concatenates it with either the Chrome storage adapter or the localStorage
// adapter, so both installation paths run the same DOM, glass and a11y code.
(function registerOpenSeaSkinCore(global) {
  'use strict';

  const IDS = Object.freeze({
    frame: '__open-sea-skin__',
    glass: '__open-sea-skin-glass__',
    uiStyle: '__open-sea-skin-glass__-ui',
    button: '__open-sea-skin-btn__',
    panel: '__open-sea-skin-panel__',
  });

  const DEFAULTS = Object.freeze({
    enabled: true,
    sea: 45,
    time: 55,
    glass: 72,
    autoCycle: true,
  });

  const COPY = Object.freeze({
    zh: {
      button: '海洋皮肤设置',
      close: '关闭',
      sea: '波浪大小',
      time: '日光',
      glass: '玻璃不透明度',
      note: '调节即时生效并自动保存；手动设定「日光」后会停止自动昼夜循环。',
      times: ['黄昏', '金色时刻', '下午', '正午'],
    },
    en: {
      button: 'Open Sea skin settings',
      close: 'Close',
      sea: 'Sea state',
      time: 'Daylight',
      glass: 'Glass opacity',
      note: 'Changes apply immediately and save automatically. Setting daylight manually stops the automatic day cycle.',
      times: ['Dusk', 'Golden hour', 'Afternoon', 'Midday'],
    },
  });

  const WAVE_ICON = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
  <path d="M1.5 8.5c1.2-1.7 2.4-1.7 3.6 0s2.4 1.7 3.6 0 1.9-1.2 3-0.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M1.5 12c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 1.9-1 3-.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>
</svg>`;

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function normalize(raw) {
    return {
      enabled: raw.enabled !== false,
      sea: clamp(raw.sea, 0, 100, DEFAULTS.sea),
      time: clamp(raw.time, 0, 100, DEFAULTS.time),
      glass: clamp(raw.glass, 40, 90, DEFAULTS.glass),
      autoCycle: raw.autoCycle !== false,
    };
  }

  function selectCopy(locale) {
    const requested = locale || document.documentElement.lang || navigator.language || 'en';
    return requested.toLowerCase().startsWith('zh') ? COPY.zh : COPY.en;
  }

  function timeLabel(copy, value) {
    const t = value / 100;
    if (t < 0.12) return copy.times[0];
    if (t < 0.30) return copy.times[1];
    if (t < 0.62) return copy.times[2];
    return copy.times[3];
  }

  function alpha(value) {
    return Number(value.toFixed(2));
  }

  function glassCss(glass) {
    const light = glass / 100;
    const dark = Math.max(0.40, light - 0.12);
    return `
/* Open Sea Skin: one translucent shell; nested fills must not compound. */
body {
  background: transparent !important;
  --dsw-alias-bg-base: rgba(255, 255, 255, ${alpha(light)}) !important;
  --dsw-alias-bg-layer-1: rgba(255, 255, 255, ${alpha(light)}) !important;
  --dsw-alias-bg-layer-2: rgba(255, 255, 255, ${alpha(light)}) !important;
  --dsw-alias-bg-layer-3: rgba(255, 255, 255, ${alpha(light)}) !important;
  --dsw-alias-bg-module-platform: rgba(245, 246, 247, ${alpha(light + 0.02)}) !important;
  --dsw-alias-bg-multi-select: rgba(245, 246, 247, ${alpha(light + 0.02)}) !important;
  --dsw-alias-bg-overlay: rgba(233, 236, 242, ${alpha(Math.min(0.96, light + 0.10))}) !important;
  --dsw-specific-sidebar-fill: rgba(249, 250, 251, ${alpha(Math.max(0.36, light - 0.04))}) !important;
  --dsw-specific-selector: rgba(245, 246, 247, ${alpha(light + 0.02)}) !important;
}
body[data-ds-dark-theme] {
  --dsw-alias-bg-base: rgba(9, 12, 16, ${alpha(dark)}) !important;
  --dsw-alias-bg-layer-1: rgba(12, 16, 22, ${alpha(dark)}) !important;
  --dsw-alias-bg-layer-2: rgba(16, 20, 27, ${alpha(dark)}) !important;
  --dsw-alias-bg-layer-3: rgba(20, 25, 33, ${alpha(dark)}) !important;
  --dsw-alias-bg-module-platform: rgba(13, 17, 23, ${alpha(dark + 0.02)}) !important;
  --dsw-alias-bg-multi-select: rgba(13, 17, 23, ${alpha(dark + 0.02)}) !important;
  --dsw-alias-bg-overlay: rgba(18, 22, 30, ${alpha(Math.min(0.92, dark + 0.14))}) !important;
  --dsw-specific-sidebar-fill: rgba(11, 15, 21, ${alpha(Math.max(0.35, dark - 0.05))}) !important;
  --dsw-specific-selector: rgba(13, 17, 23, ${alpha(dark + 0.02)}) !important;
}
/* Legacy Harness builds: these CSS-module hashes are best-effort fallbacks. */
.wSkVaW_root,
.pI_x6G_sidebarCol,
.hHd-Xa_root {
  background: transparent !important;
}`;
  }

  function uiCss() {
    return `
#${IDS.button} {
  position: fixed; z-index: 6000; width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 10px; border: 1px solid rgba(255,255,255,.14);
  background: rgba(12,16,22,.58); backdrop-filter: blur(14px) saturate(130%);
  color: #9fb3bd; cursor: pointer; padding: 0;
  transition: color .18s ease, border-color .18s ease, background .18s ease, box-shadow .18s ease, transform .1s ease;
}
#${IDS.button}:hover { color:#8fe9e4; border-color:rgba(143,233,228,.5); background:rgba(16,22,30,.72); }
#${IDS.button}.active { color:#dafdfb; border-color:rgba(143,233,228,.55); background:rgba(143,233,228,.14); box-shadow:0 0 14px rgba(143,233,228,.25); }
#${IDS.button}:active { transform:scale(.94); }
#${IDS.button}:focus-visible, #${IDS.panel} button:focus-visible, #${IDS.panel} input:focus-visible { outline:2px solid rgba(143,233,228,.7); outline-offset:2px; }
#${IDS.panel} {
  position:fixed; z-index:6001; width:250px; padding:16px;
  border-radius:16px; border:1px solid rgba(255,255,255,.14);
  background:rgba(10,14,20,.82); backdrop-filter:blur(22px) saturate(140%);
  box-shadow:0 18px 50px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.1);
  color:#eef4f6; font-family:-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;
  display:none;
}
#${IDS.panel}.open { display:block; }
#${IDS.panel} .oss-title { display:flex; align-items:center; justify-content:space-between; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,.6); margin-bottom:14px; }
#${IDS.panel} .oss-mark, #${IDS.panel} .oss-value { color:#8fe9e4; }
#${IDS.panel} .oss-close { background:none; border:0; color:rgba(255,255,255,.55); font-size:18px; line-height:1; cursor:pointer; padding:3px 6px; border-radius:6px; }
#${IDS.panel} .oss-close:hover { color:#fff; background:rgba(255,255,255,.08); }
#${IDS.panel} .oss-row { margin-top:13px; }
#${IDS.panel} .oss-head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:9px; font-size:11px; letter-spacing:.1em; color:rgba(255,255,255,.7); }
#${IDS.panel} .oss-value { font-variant-numeric:tabular-nums; }
#${IDS.panel} input[type='range'] { appearance:none; display:block; width:100%; height:14px; margin:0; padding:0; background:transparent; cursor:pointer; }
#${IDS.panel} input[type='range']::-webkit-slider-runnable-track { height:3px; border-radius:2px; background:rgba(255,255,255,.2); }
#${IDS.panel} input[type='range']::-webkit-slider-thumb { appearance:none; width:14px; height:14px; margin-top:-5.5px; border:0; border-radius:50%; background:#8fe9e4; box-shadow:0 0 10px rgba(143,233,228,.75); }
#${IDS.panel} input[type='range']::-moz-range-track { height:3px; border-radius:2px; background:rgba(255,255,255,.2); }
#${IDS.panel} input[type='range']::-moz-range-thumb { width:14px; height:14px; border:0; border-radius:50%; background:#8fe9e4; box-shadow:0 0 10px rgba(143,233,228,.75); }
#${IDS.panel} .oss-note { margin-top:13px; font-size:10px; line-height:1.7; color:rgba(255,255,255,.46); }
@media (prefers-reduced-motion: reduce) {
  #${IDS.button}, #${IDS.panel}, #${IDS.panel} * { transition:none !important; }
}`;
  }

  function createController(options) {
    if (!options || typeof options.assetUrl !== 'function' || !options.storage) {
      throw new TypeError('OpenSeaSkinCore requires assetUrl() and storage adapters.');
    }

    const copy = selectCopy(options.locale);
    let state = { ...DEFAULTS };
    let ownsSurface = false;
    let panelOpen = false;
    let previousFocus = null;
    let placementObserver = null;
    let placementFrame = 0;
    const surfaceCleanups = [];
    const controllerCleanups = [];

    const on = (target, event, listener, settings) => {
      target.addEventListener(event, listener, settings);
      surfaceCleanups.push(() => target.removeEventListener(event, listener, settings));
    };

    const save = (patch) => {
      state = normalize({ ...state, ...patch });
      return Promise.resolve(options.storage.set(patch)).catch((error) => {
        console.warn('[Open Sea Skin] Failed to save settings.', error);
      });
    };

    const updateGlass = () => {
      const style = document.getElementById(IDS.glass);
      if (style) style.textContent = glassCss(state.glass);
    };

    const postToOcean = () => {
      const frame = document.getElementById(IDS.frame);
      if (!(frame instanceof HTMLIFrameElement) || !frame.contentWindow) return;
      let targetOrigin = '*';
      try { targetOrigin = new URL(frame.src).origin; } catch { /* local test documents may have no absolute base URL */ }
      frame.contentWindow.postMessage({
        type: 'oss-set', sea: state.sea, t: state.time, auto: state.autoCycle,
      }, targetOrigin);
    };

    const placeButton = () => {
      const button = document.getElementById(IDS.button);
      if (!(button instanceof HTMLElement)) return;
      const selectors = [
        '[data-slot="sidebar.settings"] button',
        '[data-testid="settings-trigger"]',
        '.VOzbGW_trigger',
      ];
      const trigger = selectors.map((selector) => document.querySelector(selector))
        .find((candidate) => candidate instanceof HTMLElement && candidate.getBoundingClientRect().width > 0);
      if (trigger instanceof HTMLElement) {
        const rect = trigger.getBoundingClientRect();
        button.style.left = `${Math.round(rect.right + 8)}px`;
        button.style.top = `${Math.round(rect.top + rect.height / 2 - 17)}px`;
        button.style.bottom = 'auto';
      } else {
        button.style.left = '16px';
        button.style.bottom = '16px';
        button.style.top = 'auto';
      }
    };

    const schedulePlace = () => {
      cancelAnimationFrame(placementFrame);
      placementFrame = requestAnimationFrame(placeButton);
    };

    const setPanelOpen = (open) => {
      const button = document.getElementById(IDS.button);
      const panel = document.getElementById(IDS.panel);
      if (!(button instanceof HTMLButtonElement) || !(panel instanceof HTMLElement)) return;
      panelOpen = open;
      panel.classList.toggle('open', open);
      button.classList.toggle('active', open);
      button.setAttribute('aria-expanded', String(open));
      if (open) {
        previousFocus = document.activeElement;
        const rect = button.getBoundingClientRect();
        panel.style.left = `${Math.min(Math.max(12, rect.left - panel.offsetWidth + 34), window.innerWidth - panel.offsetWidth - 12)}px`;
        panel.style.bottom = `${Math.max(12, window.innerHeight - rect.top + 10)}px`;
        panel.querySelector('input')?.focus();
      } else if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
    };

    const mountOcean = () => {
      const root = document.body || document.documentElement;
      if (!root || document.getElementById(IDS.frame)) return false;
      const frame = document.createElement('iframe');
      const query = new URLSearchParams({
        skin: '1',
        sea: String(state.sea),
        t: String(state.time),
        auto: state.autoCycle ? '1' : '0',
        parentOrigin: location.origin,
      });
      frame.id = IDS.frame;
      frame.src = `${options.assetUrl('skin.html')}?${query}`;
      frame.setAttribute('aria-hidden', 'true');
      frame.setAttribute('tabindex', '-1');
      frame.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:0;pointer-events:none;background:transparent;';
      root.insertBefore(frame, root.firstChild);

      const style = document.createElement('style');
      style.id = IDS.glass;
      style.textContent = glassCss(state.glass);
      (document.head || document.documentElement).appendChild(style);
      ownsSurface = true;
      return true;
    };

    const mountUi = () => {
      if (document.getElementById(IDS.button)) return;
      const style = document.createElement('style');
      style.id = IDS.uiStyle;
      style.textContent = uiCss();
      (document.head || document.documentElement).appendChild(style);

      const button = document.createElement('button');
      button.id = IDS.button;
      button.type = 'button';
      button.title = copy.button;
      button.setAttribute('aria-label', copy.button);
      button.setAttribute('aria-controls', IDS.panel);
      button.setAttribute('aria-expanded', 'false');
      button.innerHTML = WAVE_ICON;

      const panel = document.createElement('div');
      panel.id = IDS.panel;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'false');
      panel.setAttribute('aria-label', copy.button);
      panel.innerHTML = `
        <div class="oss-title"><span>OPEN SEA <span class="oss-mark">·</span> SKIN</span><button class="oss-close" type="button" aria-label="${copy.close}">×</button></div>
        <div class="oss-row"><div class="oss-head"><label for="${IDS.panel}-sea-range">${copy.sea}</label><output class="oss-value" id="${IDS.panel}-sea" for="${IDS.panel}-sea-range"></output></div><input type="range" id="${IDS.panel}-sea-range" min="0" max="100" step="1" /></div>
        <div class="oss-row"><div class="oss-head"><label for="${IDS.panel}-time-range">${copy.time}</label><output class="oss-value" id="${IDS.panel}-time" for="${IDS.panel}-time-range"></output></div><input type="range" id="${IDS.panel}-time-range" min="0" max="100" step="1" /></div>
        <div class="oss-row"><div class="oss-head"><label for="${IDS.panel}-glass-range">${copy.glass}</label><output class="oss-value" id="${IDS.panel}-glass" for="${IDS.panel}-glass-range"></output></div><input type="range" id="${IDS.panel}-glass-range" min="40" max="90" step="1" /></div>
        <p class="oss-note">${copy.note}</p>`;

      const host = document.body || document.documentElement;
      host.append(button, panel);

      const seaRange = panel.querySelector(`#${IDS.panel}-sea-range`);
      const timeRange = panel.querySelector(`#${IDS.panel}-time-range`);
      const glassRange = panel.querySelector(`#${IDS.panel}-glass-range`);
      const seaOut = panel.querySelector(`#${IDS.panel}-sea`);
      const timeOut = panel.querySelector(`#${IDS.panel}-time`);
      const glassOut = panel.querySelector(`#${IDS.panel}-glass`);

      const syncUi = () => {
        seaRange.value = String(state.sea);
        timeRange.value = String(state.time);
        glassRange.value = String(state.glass);
        seaOut.textContent = String(state.sea).padStart(2, '0');
        timeOut.textContent = timeLabel(copy, state.time);
        glassOut.textContent = `${state.glass}%`;
      };
      syncUi();

      on(seaRange, 'input', () => {
        state.sea = clamp(seaRange.value, 0, 100, DEFAULTS.sea);
        seaOut.textContent = String(state.sea).padStart(2, '0');
        void save({ sea: state.sea });
        postToOcean();
      });
      on(timeRange, 'input', () => {
        state.time = clamp(timeRange.value, 0, 100, DEFAULTS.time);
        state.autoCycle = false;
        timeOut.textContent = timeLabel(copy, state.time);
        void save({ time: state.time, autoCycle: false });
        postToOcean();
      });
      on(glassRange, 'input', () => {
        state.glass = clamp(glassRange.value, 40, 90, DEFAULTS.glass);
        glassOut.textContent = `${state.glass}%`;
        updateGlass();
        void save({ glass: state.glass });
      });

      on(button, 'click', () => setPanelOpen(!panelOpen));
      on(panel.querySelector('.oss-close'), 'click', () => setPanelOpen(false));
      on(document, 'click', (event) => {
        if (panelOpen && !panel.contains(event.target) && !button.contains(event.target)) setPanelOpen(false);
      });
      on(document, 'keydown', (event) => {
        if (!panelOpen) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          setPanelOpen(false);
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...panel.querySelectorAll('button, input')].filter((element) => !element.disabled);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      });
      on(window, 'resize', () => { if (!panelOpen) schedulePlace(); });

      placementObserver = new MutationObserver(schedulePlace);
      placementObserver.observe(host, { childList: true, subtree: true });
      schedulePlace();
    };

    const unmount = () => {
      panelOpen = false;
      placementObserver?.disconnect();
      placementObserver = null;
      cancelAnimationFrame(placementFrame);
      while (surfaceCleanups.length > 0) surfaceCleanups.pop()();
      if (ownsSurface) {
        document.getElementById(IDS.frame)?.remove();
        document.getElementById(IDS.glass)?.remove();
      }
      document.getElementById(IDS.button)?.remove();
      document.getElementById(IDS.panel)?.remove();
      document.getElementById(IDS.uiStyle)?.remove();
      ownsSurface = false;
    };

    const applyEnabled = () => {
      if (!state.enabled) { unmount(); return; }
      // The extension and both native paths intentionally share the same ids.
      // Whichever implementation mounted first owns the surface; later ones
      // leave it untouched instead of double-rendering WebGPU.
      if (document.getElementById(IDS.frame)) return;
      if (mountOcean()) mountUi();
    };

    const ready = () => new Promise((resolve) => {
      if (document.body) { resolve(); return; }
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });

    const start = async () => {
      await ready();
      try {
        state = normalize(await options.storage.get(DEFAULTS));
      } catch (error) {
        console.warn('[Open Sea Skin] Failed to load settings; using defaults.', error);
      }
      applyEnabled();
      if (typeof options.listen === 'function') {
        const dispose = options.listen((patch) => {
          state = normalize({ ...state, ...patch });
          applyEnabled();
          updateGlass();
          postToOcean();
        });
        if (typeof dispose === 'function') controllerCleanups.push(dispose);
      }
    };

    const stop = () => {
      unmount();
      while (controllerCleanups.length > 0) controllerCleanups.pop()();
    };

    return Object.freeze({ start, stop, getState: () => ({ ...state }) });
  }

  global.OpenSeaSkinCore = Object.freeze({ createController, DEFAULTS, IDS });
})(globalThis);

// Chrome/Edge MV3 adapter for the shared skin controller.
(() => {
  'use strict';
  const controller = globalThis.OpenSeaSkinCore.createController({
    assetUrl: (path) => chrome.runtime.getURL(path),
    storage: {
      get: async (defaults) => {
        const stored = await chrome.storage.sync.get({
          skinEnabled: defaults.enabled,
          skinSea: defaults.sea,
          skinTime: defaults.time,
          skinGlass: defaults.glass,
          skinAutoCycle: defaults.autoCycle,
        });
        return {
          enabled: stored.skinEnabled,
          sea: stored.skinSea,
          time: stored.skinTime,
          glass: stored.skinGlass,
          autoCycle: stored.skinAutoCycle,
        };
      },
      set: (patch) => chrome.storage.sync.set({
        ...(patch.enabled === undefined ? {} : { skinEnabled: patch.enabled }),
        ...(patch.sea === undefined ? {} : { skinSea: patch.sea }),
        ...(patch.time === undefined ? {} : { skinTime: patch.time }),
        ...(patch.glass === undefined ? {} : { skinGlass: patch.glass }),
        ...(patch.autoCycle === undefined ? {} : { skinAutoCycle: patch.autoCycle }),
      }),
    },
    listen: (notify) => {
      const listener = (changes, area) => {
        if (area !== 'sync') return;
        const patch = {};
        if (changes.skinEnabled) patch.enabled = changes.skinEnabled.newValue;
        if (changes.skinSea) patch.sea = changes.skinSea.newValue;
        if (changes.skinTime) patch.time = changes.skinTime.newValue;
        if (changes.skinGlass) patch.glass = changes.skinGlass.newValue;
        if (changes.skinAutoCycle) patch.autoCycle = changes.skinAutoCycle.newValue;
        if (Object.keys(patch).length > 0) notify(patch);
      };
      chrome.storage.onChanged.addListener(listener);
      return () => chrome.storage.onChanged.removeListener(listener);
    },
  });
  void controller.start();
})();
