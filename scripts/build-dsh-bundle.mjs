import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const check = process.argv.includes('--check')
const target = resolve(root, 'plugin/client.js')
const core = readFileSync(resolve(root, 'shared/skin-core.js'), 'utf8')
const checker = readFileSync(resolve(root, 'shared/update-checker.js'), 'utf8')
const version = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version

const adapter = String.raw`
  const KEYS = Object.freeze({
    enabled: 'ossEnabled',
    sea: 'ossSea',
    time: 'ossTime',
    glass: 'ossGlass',
    autoCycle: 'ossAutoCycle',
  });

  function readSetting(key, fallback) {
    try {
      const value = localStorage.getItem(KEYS[key]);
      if (value === null) return fallback;
      if (key === 'enabled' || key === 'autoCycle') return value !== 'false';
      return Number(value);
    } catch {
      return fallback;
    }
  }

  exports.name = 'open-sea-skin-client';
  exports.inject = [];
  exports.apply = function apply(ctx) {
    const controller = globalThis.OpenSeaSkinCore.createController({
      assetUrl: (path) => '/open-sea-skin/' + path,
      updates: globalThis.OpenSeaUpdateChecker.create({ currentVersion: OPEN_SEA_VERSION, kind: 'plugin', ctx }),
      storage: {
        get: async (defaults) => ({
          enabled: readSetting('enabled', defaults.enabled),
          sea: readSetting('sea', defaults.sea),
          time: readSetting('time', defaults.time),
          glass: readSetting('glass', defaults.glass),
          autoCycle: readSetting('autoCycle', defaults.autoCycle),
        }),
        set: async (patch) => {
          try {
            for (const [key, value] of Object.entries(patch)) {
              localStorage.setItem(KEYS[key], String(value));
            }
          } catch {
            // Locked-down storage keeps the live value for this page.
          }
        },
      },
    });
    void controller.start();
    ctx.effect(() => () => controller.stop(), 'open-sea-skin: browser surface');
  };

  return module.exports;
}});
`

const expected = `// GENERATED from shared sources. Run npm run build after editing shared sources.\nwindow.__ModuleLoader__.load({ id: "open-sea-skin", factory: (require) => {\n  var module = { exports: {} };\n  var exports = module.exports;\n  const OPEN_SEA_VERSION = ${JSON.stringify(version)};\n${core}\n${checker}\n${adapter}`

if (check) {
  if (!existsSync(target) || readFileSync(target, 'utf8') !== expected) {
    throw new Error('plugin/client.js is stale; run npm run build')
  }
} else {
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, expected)
  console.log('DeepSeek Harness installable bundle is up to date.')
}
