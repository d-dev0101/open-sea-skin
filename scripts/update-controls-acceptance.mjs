import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { findChromeForTesting, watchPageErrors } from './browser-support.mjs';

// Isolated, synthetic Harness shell: no account, chat content, GPU, or live
// update service is involved. Registry/cache behavior has separate unit tests.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const evidence = resolve(root, '.local-evidence/update-controls-2026-11-13');
const panelId = '__open-sea-skin-panel__';
const buttonId = '__open-sea-skin-btn__';
const browser = await chromium.launch({
  executablePath: await findChromeForTesting(chromium.executablePath()),
  headless: process.env.OSS_HEADLESS !== '0',
});
const results = [];
await mkdir(evidence, { recursive: true });

async function fixture(viewport = { width: 1000, height: 850 }, kind = 'plugin') {
  const context = await browser.newContext({ viewport, locale: 'zh-CN' });
  const page = await context.newPage();
  const errors = watchPageErrors(page, 'update-controls');
  await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;background:linear-gradient(160deg,#344b53,#0c2630 68%,#12383d);color:#e8f2f4;font:15px system-ui,sans-serif}
    main{padding:38px 32px}h1{font-size:24px;font-weight:550;margin:0 0 12px}p{color:#a9c0c8;line-height:1.7}
    .mock-label{display:inline-block;border:1px solid #75939b55;border-radius:7px;padding:5px 9px;font-size:12px;color:#b3d9da}
  </style></head><body><main><span class="mock-label">MOCK · 本地测试</span><h1>DeepSeek Harness</h1><p>Open Sea 更新面板<br>示例界面，不含真实会话</p></main></body></html>`);
  await page.addScriptTag({ path: resolve(root, 'shared/skin-core.js') });
  await page.evaluate(async kind => {
    window.testUpdates = { calls: [], pending: [], openResult: false, openCalls: 0, saved: [] };
    window.testController = globalThis.OpenSeaSkinCore.createController({
      assetUrl: file => `https://unused.invalid/${file}`,
      storage: {
        get: defaults => ({ ...defaults, enabled: false }),
        set: patch => { window.testUpdates.saved.push(patch); },
      },
      updates: {
        kind,
        currentVersion: '1.2.9',
        check({ force, signal }) {
          window.testUpdates.calls.push({ force, signal });
          return new Promise((resolve, reject) => window.testUpdates.pending.push({ resolve, reject }));
        },
        open() {
          window.testUpdates.openCalls += 1;
          if (window.testUpdates.openResult === 'throw') throw new Error('Host update entry unavailable');
          return window.testUpdates.openResult;
        },
      },
    });
    await window.testController.start();
  }, kind);
  await page.locator(`#${buttonId}`).waitFor({ state: 'visible' });
  assert.equal(await page.locator('iframe').count(), 0, 'disabled skin must not start the GPU renderer');
  return { page, context, errors };
}

async function state(page, expected) {
  await page.waitForFunction(({ panelId, expected }) => document.querySelector(`#${panelId} .oss-updates`)?.dataset.state === expected, { panelId, expected });
}

async function resolveCheck(page, index, result) {
  await page.evaluate(({ index, result }) => window.testUpdates.pending[index].resolve(result), { index, result });
  await state(page, result.status);
}

async function calls(page) {
  return page.evaluate(() => window.testUpdates.calls.map(({ force, signal }) => ({ force, aborted: signal.aborted })));
}

async function screenshot(page, name) {
  await page.screenshot({ path: resolve(evidence, `${name}.png`) });
}

async function run(name, viewport, check, kind = 'plugin') {
  const { page, context, errors } = await fixture(viewport, kind);
  try {
    await check(page);
    assert.deepEqual(errors, [], 'unexpected browser errors');
    results.push({ name, passed: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    await screenshot(page, `${name}-failure`);
    results.push({ name, passed: false, error: error.stack, browserErrors: errors });
    console.error(`FAIL ${name}: ${error.message}`);
  } finally {
    await context.close();
  }
}

try {
  await run('update-states-and-localization', undefined, async page => {
    const launcher = page.locator(`#${buttonId}`);
    const panel = page.locator(`#${panelId}`);
    const check = panel.locator('.oss-check');
    const action = panel.locator('.oss-update-action');
    const guide = panel.locator('.oss-update-guide');
    const message = panel.locator('.oss-update-status');
    assert.deepEqual(await calls(page), [], 'opening the page alone must not check for updates');
    assert.equal(await panel.isVisible(), false);
    await launcher.click();
    await state(page, 'checking');
    assert.deepEqual(await calls(page), [{ force: false, aborted: false }]);
    assert.equal(await check.isDisabled(), true);
    assert.equal(await message.textContent(), '正在检查…');
    assert.match(await panel.locator('.oss-version').textContent(), /当前版本 v1\.2\.9/);
    await resolveCheck(page, 0, { status: 'current', latest: '1.2.9' });
    assert.equal(await message.textContent(), '已是当前安装源的最新版');
    assert.equal(await check.isEnabled(), true);
    assert.equal(await launcher.getAttribute('data-update-available'), null);
    assert.equal(await action.isVisible(), false);
    assert.equal(await guide.isVisible(), false);
    await screenshot(page, 'current-zh');

    await check.click();
    await state(page, 'checking');
    assert.equal((await calls(page))[1].force, true, 'manual check must bypass cached results');
    await resolveCheck(page, 1, { status: 'available', latest: '1.3.0' });
    assert.equal(await message.textContent(), '发现新版本 · v1.3.0');
    assert.equal(await launcher.getAttribute('data-update-available'), '');
    assert.match(await launcher.getAttribute('aria-label'), /发现新版本 v1\.3\.0/);
    assert.equal(await action.isVisible(), true);
    await screenshot(page, 'available-zh');
    await page.evaluate(() => { document.documentElement.lang = 'en'; });
    await page.waitForFunction(() => document.querySelector('.oss-check').textContent === 'Check updates');
    assert.equal(await message.textContent(), 'Update available · v1.3.0');
    assert.equal(await action.textContent(), 'Update');
    assert.equal(await panel.locator('.oss-version').textContent(), 'Installed v1.2.9');
    assert.match(await launcher.getAttribute('aria-label'), /Update available v1\.3\.0/);
    await screenshot(page, 'available-en');
    await page.evaluate(() => { document.documentElement.lang = 'zh-CN'; });
    await page.waitForFunction(() => document.querySelector('.oss-check').textContent === '检查更新');

    // An older host may not offer an update deep link. Keep the user in this
    // panel with a usable guide instead of claiming that installation started.
    await action.click();
    assert.equal(await panel.isVisible(), true);
    assert.equal(await guide.isVisible(), true);
    assert.match(await message.textContent(), /在「插件」中打开 Open Sea/);
    assert.match(await guide.getAttribute('href'), /docs\/install\.zh\.md/);
    assert.equal(new URL(await guide.getAttribute('href')).hash, '#%E6%9B%B4%E6%96%B0%E5%81%9C%E7%94%A8%E5%8D%B8%E8%BD%BD');
    assert.equal(await guide.getAttribute('target'), '_blank');
    assert.equal(await guide.getAttribute('rel'), 'noopener noreferrer');

    // Keyboard focus remains in the open panel, including the fallback link.
    const close = panel.locator('.oss-close');
    await close.focus();
    await page.keyboard.press('Shift+Tab');
    assert.equal(await guide.evaluate(el => document.activeElement === el), true);
    await page.keyboard.press('Tab');
    assert.equal(await close.evaluate(el => document.activeElement === el), true);
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(), false);
    assert.equal(await launcher.evaluate(el => document.activeElement === el), true);
    assert.equal(await launcher.getAttribute('data-update-available'), '', 'new-version badge remains when closing the panel');

    await launcher.click();
    await state(page, 'checking');
    assert.equal((await calls(page))[2].force, false, 'reopening uses the adapter cache');
    await resolveCheck(page, 2, { status: 'available', latest: '1.3.0' });
    await page.evaluate(() => { window.testUpdates.openResult = true; });
    await action.click();
    assert.equal(await panel.isVisible(), false, 'native update entry closes the quick panel');
    assert.equal(await launcher.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.evaluate(() => window.testUpdates.openCalls), 2);

    await launcher.click();
    await state(page, 'checking');
    await page.evaluate(() => window.testUpdates.pending[3].reject(new Error('Network unavailable')));
    await state(page, 'error');
    assert.equal(await message.textContent(), '暂时无法检查更新，请重试');
    assert.equal(await message.textContent().then(text => text.includes('最新版')), false);
    assert.equal(await check.isEnabled(), true);
    assert.equal(await launcher.getAttribute('data-update-available'), null);
    assert.equal(await action.isVisible(), false);

    await check.click();
    await resolveCheck(page, 4, { status: 'ahead', latest: '1.2.7' });
    assert.equal(await message.textContent(), '当前版本高于安装源版本 · v1.2.7');
    assert.equal(await action.isVisible(), false, 'an older registry version must not be offered as an update');
    assert.equal(await guide.isVisible(), true);
    assert.equal(await launcher.getAttribute('data-update-available'), null);
    await check.click();
    await resolveCheck(page, 5, { status: 'unsupported' });
    assert.equal(await message.textContent(), '此安装方式请查看更新指南');
    assert.equal(await guide.isVisible(), true);
    assert.equal(await action.isVisible(), false);
    await check.click();
    await resolveCheck(page, 6, { status: 'unavailable' });
    assert.equal(await message.textContent(), '暂无兼容的新版');
    assert.equal(await action.isVisible(), false);
    await check.click();
    await resolveCheck(page, 7, { status: 'restart', latest: '1.3.0' });
    assert.match(await message.textContent(), /新版本已安装，刷新页面或重启 Harness 后生效/);
    assert.equal(await action.isVisible(), false, 'a newer installed package needs reload, not duplicate installation');
    assert.equal(await launcher.getAttribute('data-update-available'), null);
    assert.equal(await check.isEnabled(), true);
    await page.evaluate(() => { document.documentElement.lang = 'en'; });
    await page.waitForFunction(() => document.querySelector('.oss-check').textContent === 'Check updates');
    assert.match(await message.textContent(), /reload|restart/i);
    assert.doesNotMatch(await message.textContent(), /up to date/i);
    await screenshot(page, 'restart-en');
  });

  for (const kind of ['extension', 'native']) {
    await run(`${kind}-update-guide`, undefined, async page => {
      const panel = page.locator(`#${panelId}`);
      await page.locator(`#${buttonId}`).click();
      await resolveCheck(page, 0, { status: 'available', latest: '1.3.0' });
      const guide = panel.locator('.oss-update-guide');
      const anchor = kind === 'extension' ? 'browser-extension' : 'static-installer';
      assert.equal(await panel.locator('.oss-update-action').isVisible(), false, 'external installs must not advertise a native manager action');
      assert.equal(await guide.isVisible(), true);
      assert.equal(await guide.getAttribute('href'), `https://github.com/d-dev0101/open-sea-skin/blob/main/README.zh.md#${anchor}`);
      assert.equal(await page.locator(`#${buttonId}`).getAttribute('data-update-available'), '');
      assert.equal(await panel.locator('.oss-update-status').textContent(), '发现新版本 · v1.3.0');
      await page.evaluate(() => { document.documentElement.lang = 'en'; });
      await page.waitForFunction(() => document.querySelector('.oss-check').textContent === 'Check updates');
      assert.equal(await guide.getAttribute('href'), `https://github.com/d-dev0101/open-sea-skin/blob/main/README.en.md#${anchor}`);
      assert.equal(await guide.textContent(), 'Update guide');
      assert.equal(await page.evaluate(() => window.testUpdates.openCalls), 0);
      await screenshot(page, `${kind}-guide-en`);
    }, kind);
  }

  await run('abort-and-late-response', undefined, async page => {
    await page.locator(`#${buttonId}`).click();
    await state(page, 'checking');
    assert.equal((await calls(page))[0].aborted, false);
    await page.evaluate(() => window.testController.stop());
    assert.equal((await calls(page))[0].aborted, true, 'unmount must abort a pending version request');
    await page.evaluate(async () => {
      window.testUpdates.pending[0].resolve({ status: 'available', latest: '99.0.0' });
      await Promise.resolve();
      await Promise.resolve();
    });
    assert.equal(await page.locator(`#${buttonId}`).count(), 0);
    assert.equal(await page.locator(`#${panelId}`).count(), 0);
    assert.equal(await page.locator('.oss-updates').count(), 0, 'late responses cannot remount or alter an unmounted panel');
  });

  await run('small-window-and-scroll', { width: 390, height: 480 }, async page => {
    const panel = page.locator(`#${panelId}`);
    await page.locator(`#${buttonId}`).click();
    await resolveCheck(page, 0, { status: 'available', latest: '1.3.0' });
    async function withinViewport() {
      const box = await panel.boundingBox();
      const { width, height } = page.viewportSize();
      assert.ok(box.x >= 11 && box.y >= 11, `panel starts inside viewport: ${JSON.stringify(box)}`);
      assert.ok(box.x + box.width <= width - 11 && box.y + box.height <= height - 11, `panel ends inside viewport: ${JSON.stringify(box)}`);
      const scroll = await panel.evaluate(el => ({ full: el.scrollHeight, visible: el.clientHeight, overflow: getComputedStyle(el).overflowY }));
      assert.ok(scroll.full > scroll.visible, 'the short panel scrolls instead of hiding its update controls');
      assert.equal(scroll.overflow, 'auto');
    }
    await withinViewport();
    await panel.locator('.oss-update-action').scrollIntoViewIfNeeded();
    await screenshot(page, 'short-panel');
    await panel.locator('.oss-update-action').click();
    assert.equal(await panel.locator('.oss-update-guide').isVisible(), true);
    await page.setViewportSize({ width: 320, height: 360 });
    await page.waitForFunction(() => document.querySelector('#__open-sea-skin-panel__').getBoundingClientRect().bottom <= window.innerHeight - 11);
    await withinViewport();
    await panel.locator('.oss-update-guide').scrollIntoViewIfNeeded();
    await screenshot(page, 'compact-panel');
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(), false);
  });
} finally {
  await browser.close();
  await writeFile(resolve(evidence, 'results.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    syntheticOnly: true,
    results,
  }, null, 2) + '\n');
}
if (results.some(result => !result.passed)) process.exitCode = 1;
