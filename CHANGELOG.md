# Changelog

All notable changes to Open Sea Skin are documented here.

## 1.2.7 — 2026-11-01

### 修复 / Fixed

- 皮肤控制面板不再被宿主的浅色 dialog 样式染成白底白字；提高左下角按钮与说明文字对比度。感谢 #16 中的精确复现。
- 清除官方 Windows 侧栏内层重复背景，保留单层工作区玻璃；底部区域不再叠加填色。
- 按 Harness 0.2.1-rc.5 的真实 `main.conversation` 插槽适配输入卡片、消息气泡与代码卡片的专属颜色变量，保留圆角和代码高亮；不对其它插件做全局卡片覆盖。
- Keep Open Sea controls readable in either theme and restore translucent conversation surfaces on current Harness layouts.

### 优化 / Performance

- 合并波浪法线/浪峰计算，缓存重复的余弦与视线计算。部分采纳 @zdjmrq 的 #21 建议；原 PR 已由作者关闭，并未整体合并。
- WebGPU / WebGL2 均无渲染错误，固定场景最大色值差为 1/255；800 个时空/浪高样本与原公式一致。未进行 FPS 基准，不宣称固定提速比例。原海洋效果、Logo 与动态展示图保留。

### 兼容与发布 / Compatibility and delivery

- 核对官方最新发布通道 **0.2.1-rc.5**，新增可复跑的隔离运行时安装/加载/卸载检查；[测试边界与已知问题](docs/compatibility.md)。Windows 原生完整安装仍未实测。
- 新增中文优先的问题模板，更新官网与安装文档；GitHub 包和 npm 包分阶段发布时，明确哪个版本已可安装。
- npm 发布复用 GitHub 的同一份校验包，再比对 registry integrity 和 SHA-256，避免二次打包漂移。
- 远景高光闪烁（#19）与独立波浪速度（#22）仍在跟进，不计入本次已修复项。

## 1.2.6 — 2026-10-20

### 修复 / Fixed

- 将浮层背景与工作区玻璃值分离：插件广场使用的 overlay token 保持 97% 不透明度。
- 语义 dialog / alertdialog 与设置弹窗使用独立可读底色，覆盖 body portal 中的二级插件配置弹窗；不改遮罩、层级和海洋效果。感谢 #16 的复现信息。
- Keep overlay tokens and semantic modal cards legible independently of workspace glass opacity, including sibling-portalled plugin configuration dialogs.

### 验证范围 / Verification scope

- macOS / Windows 页面结构、浅深色、40% / 90% 工作区玻璃组合回归；确认工作区透明度与 shell overlay 不变，停用后样式清除。
- 核对官方 Harness 0.2.1-rc.2 安装文档及 Modal 结构。不是 Windows 原生安装或该新版完整实机兼容认证。
- 中文安装指引明确 npm 插件优先、社区市场可选、浏览器扩展不适用于桌面客户端。Logo 未修改。

## 1.2.5 — 2026-10-10

### Fixed

- Official DeepSeek Harness Desktop `0.2.0-rc.2` now paints one glass layer
  across the sidebar, conversation, and rightbar. The conversation's nested
  background no longer compounds opacity, while the composer remains readable.
- Official Desktop Settings stays opaque enough to read when workspace glass
  is set to its minimum 40%.

### Tested

- Installed the release package into an isolated official macOS Desktop
  `0.2.0-rc.2` profile with its bundled CLI and visually verified the shell.
- Added a 0.2.x shell regression fixture for macOS/Windows structure in light
  and dark modes. Windows is fixture-tested, not native Windows E2E-tested.

### Documentation

- Clarified the Desktop install path and distinguished the GitHub release from
  the older npm package currently available through registries.

## 1.2.4 — 2026-09-09

### Fixed

- Quick controls follow asynchronous Harness document-language changes in both
  Chinese and English, including accessibility labels, without losing focus or
  control state. The observer is removed on disposal. Thanks to @Max-Null for
  reporting the issue in #6; the fix lives in the shared source and all generated
  install targets.

### Documentation

- Recommend the prebuilt npm package to avoid Git transport failures during
  installation; explain why a `git ls-remote` error is not proof of a blocked
  build script (#8).

## 1.2.3 — 2026-09-07

### Fixed

- DSH Desktop advanced and extended layouts now paint a single shared glass
  background. The sidebar, conversation and details panes no longer differ
  in opacity due to transparent sidebar overrides and stacked conversation fills.
- Composer cards and dialogs retain their own backgrounds. Disabling or
  unloading Open Sea restores the desktop's original styles.

### Tested

- Desktop shell regression based on DSH Desktop Beta `2.0.5-beta.1`: 24
  combinations of layout, native material, light/dark mode and glass opacity,
  plus settings, text input, disable/re-enable and disposal in Chromium.
- The old `1.2.2` bundle fails this regression: at 40% glass the sidebar's
  effective opacity is 0%, while nested conversation fills reach 64%.

## 1.2.2 — 2026-09-01

### Added

- Quick-controls panel gains an enable toggle, an automatic day-cycle toggle,
  and a reset-to-defaults button. Disabling the skin now only tears down the
  ocean surface while keeping the button and panel, so the skin can always be
  re-enabled from the same page.
- Public npm publishing metadata and guarded release automation for DSH
  Desktop managed installation.

### Fixed

- Dragging the daylight slider now unchecks the automatic day-cycle toggle to
  match the persisted state.
- Native source integration now supports Harness `0.1.2-alpha.3` and its split
  client store, renderer, and session services.
- Browsers without WebGPU can use a capped low-end WebGL2 fallback instead of
  stopping at an unavailable screen.

## 1.2.1 — 2026-08-18

### Changed

- The Chrome/Edge extension is now Harness-only and no longer replaces the
  browser new-tab page.
- Loopback pages must match the DeepSeek Harness title, root element, and
  server-injected boot marker before the extension changes their DOM.
- Browser acceptance now proves that real Harness pages are skinned while a
  generic localhost app and an existing third-party new-tab homepage remain
  untouched.

## 1.2.0 — 2026-08-17

### Added

- A root `dsh.bundle` package that installs directly into DeepSeek Harness.
- Lower-left quick controls for wave size, daylight, glass opacity, and the
  automatic day/night cycle in the one-line DSH installation.
- A DeepSeek Harness-specific marketplace cover and four 40%-glass gallery
  animations covering dark mode, light mode, waves, and sunset.
- Host-route boundary tests for local renderer assets.

### Fixed

- Kept the native Settings dialog above the conversation composer at wide
  aspect ratios.
- Restored the lower-left Skin settings launcher and persisted every control.

## 1.1.0 — 2026-08-17

- Added the native Harness source integration, static installer, browser
  acceptance coverage, and bilingual 40%-glass gallery.

## 1.0.0 — 2026-08-14

- Initial Open Sea WebGPU showcase and Chrome/Edge extension.
