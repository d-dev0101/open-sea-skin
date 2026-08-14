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
