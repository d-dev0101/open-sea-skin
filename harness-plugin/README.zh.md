# @deepseek-ai/dsh-client-ui-open-sea-skin

[中文](README.zh.md) | [English](README.md)

Open Sea 实时 WebGPU 海洋的 DeepSeek Harness 原生插件。Host 端注册 `ui-open-sea-skin` 持久化设置并在 `/open-sea-skin` 提供全本地渲染资源；Client 端通过 `shell.background` slot 挂载背景，在左下角与「通用设置」中注册控件，并通过 `ctx.theme.overrideTokens()` 叠加可逆的玻璃主题令牌。

## 接入 Harness 源码

在 Open Sea Skin 仓库根目录执行：

```sh
bash harness-plugin/install-into-harness.sh /absolute/path/to/deepseek-harness
cd /absolute/path/to/deepseek-harness
corepack pnpm install
corepack pnpm --filter @deepseek-ai/dsh-client-ui-open-sea-skin bundle
corepack pnpm run build
corepack pnpm dsh web
```

安装器会把包复制到 `packages/client/ui-open-sea-skin`，并幂等地添加 Client TypeScript 聚合引用、Web bundle 依赖、Cordis 启动项、设置 Web 白名单和由 layout 拥有的 `shell.background` slot；也会迁移曾导致聊天输入框盖住设置页的旧层级规则。脚本针对 Harness 提交 `47f943859bef` （2026-08-13）；若上游接入点变化，脚本会停止并报错，不会猜测修改。

启动后可用左下角「皮肤设置」快捷面板调波浪、日光与玻璃，也可打开「设置 → 通用设置 → 海洋皮肤」查看所有选项。手动拖动日光滑块后，自动循环会关闭，可通过复选框重新开启。

## 架构

- `src/index.ts`：Host 设置注册与防路径穿越的静态资源路由。
- `src/client/index.ts`：Client 插件组装、持久化设置同步与可逆主题令牌层。
- `src/client/OpenSeaBackground.tsx`：通过 layout slot 注册的同源背景 iframe。
- `src/client/OpenSeaSettingsRow.tsx`：双语、键盘可访问的「通用设置」控件。
- `src/client/OpenSeaQuickControls.tsx`：原生侧栏入口与快捷面板。
- `assets/`：由仓库 `shared/` 目录的唯一源文件生成。

扩展、dist 注入和原生插件共用 `#__open-sea-skin__` / `#__open-sea-skin-btn__` DOM 标记。原生组件在挂载前检查该标记，因此同时安装多条路径也不会启动第二个渲染器。

## 模型体验

无。本插件只修改浏览器展示与用户设置，不会添加模型可见上下文、工具、消息或供应商请求。

#### KV Cache 影响

无；本插件不会组装或修改模型请求。

## 已知限制与待办

- 原生包需要 `ui-layout` 增加一个 `shell.background` slot；目前已自动化，但在 Harness 未原生提供该 slot 前仍属于源码接入修改。
- 切换渲染质量会重载隔离的海洋 iframe，因为网格密度和 GPU 适配器偏好是启动时决策。
- 当前原生包面向 Web Client；Electron/file 协议的资源传输需要独立的资源提供器。
