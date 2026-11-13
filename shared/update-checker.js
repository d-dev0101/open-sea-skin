// Optional metadata checks. The ocean renderer and settings never depend on them.
(() => {
  'use strict';

  const PACKAGE = 'open-sea-skin';
  const NPM_LATEST = 'https://registry.npmjs.org/open-sea-skin/latest';
  const GITHUB_LATEST = 'https://api.github.com/repos/d-dev0101/open-sea-skin/releases/latest';
  const CACHE_MS = 6 * 60 * 60 * 1000;

  function parseVersion(value) {
    if (typeof value !== 'string' || value.length > 128) return null;
    const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
    if (!match) return null;
    const parts = match.slice(1, 4).map(Number);
    const pre = match[4] ? match[4].split('.') : [];
    if (!parts.every(Number.isSafeInteger) || pre.some(part => /^0\d+$/.test(part))) return null;
    return { parts, pre };
  }

  function compareVersion(a, b) {
    const left = parseVersion(a), right = parseVersion(b);
    if (!left || !right) throw new Error('Invalid update version');
    for (let index = 0; index < 3; index++) {
      if (left.parts[index] !== right.parts[index]) return left.parts[index] > right.parts[index] ? 1 : -1;
    }
    if (!left.pre.length || !right.pre.length) return left.pre.length === right.pre.length ? 0 : left.pre.length ? -1 : 1;
    for (let index = 0; index < Math.max(left.pre.length, right.pre.length); index++) {
      const x = left.pre[index], y = right.pre[index];
      if (x === y) continue;
      if (x === undefined || y === undefined) return x === undefined ? -1 : 1;
      const xn = /^\d+$/.test(x), yn = /^\d+$/.test(y);
      if (xn !== yn) return xn ? -1 : 1;
      if (xn && x.length !== y.length) return x.length > y.length ? 1 : -1;
      return x > y ? 1 : -1;
    }
    return 0;
  }

  // ctx.get is Cordis's optional service lookup. Direct ctx.someService access
  // requires inject and would prevent older hosts from loading the skin.
  function service(ctx, name) {
    try { return typeof ctx?.get === 'function' ? ctx.get(name) : undefined; }
    catch { return undefined; }
  }

  function bounded(operation, signal, timeoutMs) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      let timer;
      let settled = false;
      const finish = (callback, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', cancel);
        callback(value);
      };
      const cancel = () => {
        controller.abort();
        const error = new Error('Update check cancelled');
        error.name = 'AbortError';
        finish(reject, error);
      };
      if (signal?.aborted) { cancel(); return; }
      signal?.addEventListener('abort', cancel, { once: true });
      timer = setTimeout(() => {
        controller.abort();
        finish(reject, new Error('Update check timed out'));
      }, timeoutMs);
      Promise.resolve().then(() => {
        if (controller.signal.aborted) throw new Error('Update check cancelled');
        return operation(controller.signal);
      }).then(
        value => finish(resolve, value), error => finish(reject, error),
      );
    });
  }

  function create(options) {
    const currentVersion = options.currentVersion;
    const fetchMetadata = options.fetch || globalThis.fetch?.bind(globalThis);
    const now = options.now || Date.now;
    const timeoutMs = Math.max(1, Math.min(10000, options.timeoutMs || 10000));
    const kind = options.kind || 'plugin';
    let cache;
    let sequence = 0;

    function publishedVersion(latest, source) {
      const parsed = parseVersion(latest);
      if (!parsed) throw new Error('Invalid published update version');
      if (parsed.pre.length) return { status: 'unavailable', source };
      const order = compareVersion(currentVersion, latest);
      return { status: order < 0 ? 'available' : order > 0 ? 'ahead' : 'current', latest, source };
    }

    async function json(url, signal) {
      if (typeof fetchMetadata !== 'function') throw new Error('Update checks are unavailable');
      const response = await fetchMetadata(url, {
        method: 'GET', mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer',
        cache: 'no-store', redirect: 'error', signal,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Update metadata request failed');
      return response.json();
    }

    async function fromHost(manager, signal) {
      const answer = await manager.listVersions(PACKAGE, {}, signal);
      if (answer?.ok !== true) throw new Error('Harness could not check plugin updates');
      const list = answer.value;
      if (list?.status === 'refused') {
        if (list.problem === 'not-updatable') return { status: 'unsupported', source: 'Harness' };
        throw new Error('The installed source could not check plugin updates');
      }
      if (list?.status !== 'listed' || !parseVersion(list.installed) || !Array.isArray(list.versions)) {
        throw new Error('Invalid Harness version response');
      }
      // The manager lists releases newer than the on-disk installation. An
      // empty list does not mean this still-running page has loaded it yet.
      if (compareVersion(list.installed, currentVersion) > 0) {
        return { status: 'restart', latest: list.installed, source: 'Harness' };
      }
      // Ignore malformed metadata rather than allowing it into UI or links.
      // A malformed response is a failure, never evidence of being up to date.
      if (list.versions.some(item => !parseVersion(item?.version)
        || typeof item.bundle !== 'boolean' || typeof item.prerelease !== 'boolean')) {
        throw new Error('Invalid Harness version metadata');
      }
      const newer = list.versions.filter(item => compareVersion(item.version, currentVersion) > 0);
      const candidates = newer.filter(item => item.bundle && item.incompatible === undefined
        && item.deprecated === undefined && !item.prerelease && !parseVersion(item.version).pre.length);
      candidates.sort((a, b) => compareVersion(b.version, a.version));
      if (candidates.length) return { status: 'available', latest: candidates[0].version, source: 'Harness' };
      return { status: newer.length ? 'unavailable' : 'current', source: 'Harness' };
    }

    async function fromNpm(signal) {
      const metadata = await json(NPM_LATEST, signal);
      if (metadata?.name !== PACKAGE) throw new Error('Unexpected package metadata');
      return publishedVersion(metadata.version, 'npm');
    }

    async function fromRelease(signal) {
      const release = await json(GITHUB_LATEST, signal);
      const latest = typeof release?.tag_name === 'string' ? release.tag_name.replace(/^v/, '') : '';
      if (release?.draft !== false || release.prerelease !== false || !parseVersion(latest)
        || !Array.isArray(release.assets)) throw new Error('Invalid release metadata');
      // npm and extension releases can drift. Only offer a release containing
      // the artifact this installation uses, never just the npm dist-tag.
      const assetName = kind === 'extension'
        ? `open-sea-skin-extension-v${latest}.zip` : `open-sea-skin-${latest}.tgz`;
      const artifact = release.assets.some(asset => asset?.name === assetName
        && asset.state === 'uploaded' && Number.isFinite(asset.size) && asset.size > 0);
      if (!artifact) return { status: 'unavailable', source: 'GitHub' };
      return publishedVersion(latest, 'GitHub');
    }

    return Object.freeze({
      currentVersion,
      kind,
      async check({ force = false, signal } = {}) {
        if (signal?.aborted) {
          const error = new Error('Update check cancelled'); error.name = 'AbortError'; throw error;
        }
        if (!parseVersion(currentVersion)) throw new Error('Invalid installed update version');
        const manager = kind === 'plugin' ? service(options.ctx, 'remote.pluginManager') : undefined;
        const hasManager = typeof manager?.listVersions === 'function';
        // Cordis may return a fresh tracing proxy on each ctx.get call, so
        // cache by capability rather than service object identity.
        const driver = hasManager ? 'Harness' : kind === 'plugin' ? 'npm' : 'GitHub';
        if (!force && cache?.driver === driver && now() - cache.at >= 0 && now() - cache.at < CACHE_MS) {
          return { ...cache.result };
        }
        const request = ++sequence;
        cache = undefined;
        const result = await bounded(checkSignal => hasManager ? fromHost(manager, checkSignal)
          : kind === 'plugin' ? fromNpm(checkSignal) : fromRelease(checkSignal), signal, timeoutMs);
        if (request === sequence) cache = { driver, at: now(), result };
        return { ...result };
      },
      open() {
        // The official manager owns confirmation, registry selection and
        // installation. This feature never runs installs or shell commands.
        const navigation = kind === 'plugin' ? service(options.ctx, 'pluginNavigation') : undefined;
        if (typeof navigation?.openBundle !== 'function') return false;
        try { navigation.openBundle(PACKAGE); return true; } catch { return false; }
      },
    });
  }

  globalThis.OpenSeaUpdateChecker = Object.freeze({ create });
})();
