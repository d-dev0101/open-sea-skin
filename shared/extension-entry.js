// Chrome/Edge MV3 adapter for the shared skin controller.
(() => {
  'use strict';

  const isHarnessPage = () => {
    if (document.title !== 'DeepSeek Harness' || !document.getElementById('root')) return false;
    return [...document.scripts].some((script) =>
      /window\.__DSH_BOOT__\s*=/.test(script.textContent || ''));
  };

  const ready = () => new Promise((resolve) => {
    if (document.readyState !== 'loading') { resolve(); return; }
    document.addEventListener('DOMContentLoaded', resolve, { once: true });
  });

  const start = async () => {
    await ready();
    // Loopback access is intentionally broad enough for custom Harness ports,
    // so verify the server-rendered Harness boot marker before touching the DOM.
    if (!isHarnessPage()) return;

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
    await controller.start();
  };

  void start();
})();
