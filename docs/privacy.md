# 🔒 权限与隐私 / Privacy

Open Sea 没有聊天内容上传、统计分析或遥测功能。皮肤会读取 Harness 页面标记、主题与布局来注入海洋背景和样式，因此「完全不访问任何数据」并不准确。

- **浏览器扩展：** 仅申请 `storage` 和本机 `127.0.0.1` / `localhost` 页面权限。视觉偏好保存在 `chrome.storage.sync`；开启浏览器同步时，这些偏好可能由 Chrome / Edge 同步到其他设备。皮肤不会把聊天内容写入同步存储。
- **DSH npm 插件与静态加载器：** 视觉偏好保存在当前页面的 localStorage。
- **原生源码集成：** 使用 Harness 设置服务保存偏好。
- **安装版与当前官网：** 海洋渲染依赖和字体随包提供。官网、npm 与 GitHub 的页面访问、安装和更新本身仍需要网络。
- **版本检查（1.2.9 起）：** 打开皮肤面板或点击「检查更新」时查询版本，成功结果在本页缓存 6 小时，不后台轮询。官方插件优先通过 Harness 查询原安装源，认证由宿主管理；旧宿主回退匿名访问 npm 官方源。扩展与静态安装匿名访问 GitHub 最新 Release 元数据。独立查询不附带凭据或页面来源，不上传聊天内容。访问服务仍会收到正常网络连接信息（如 IP 地址）。点击更新只打开宿主详情或指南，不自动安装。
- **历史演示 `site/`：** 保留原版实现，会使用 jsDelivr；不包含在安装版或当前官网中。

以上只描述 Open Sea，不代表浏览器同步、宿主客户端或托管平台的数据处理方式。

## English

Open Sea Skin does not collect, transmit, sell, or share personal information,
usage data, page content, prompts, conversations, or identifiers.

The browser extension uses:

- `storage`: to retain the on/off state and visual preferences.
- `http://127.0.0.1/*` and `http://localhost/*`: to inject the background into a
  locally served DeepSeek Harness interface.

There are no remote host permissions, analytics SDKs, advertising systems,
tracking pixels, or remote rendering dependencies. three.js and Geist are included locally.
Version checks (1.2.9+) run on panel open or manual refresh, with a six-hour
page-local cache and no polling. The npm plugin prefers the host registry manager;
its authentication stays with Harness. Older hosts fall back to public npm metadata.
Extension/static loaders query public GitHub release metadata. Independent requests
omit credentials and referrers, contain no chat data, and expose ordinary network
connection details such as IP addresses to the service. Updates require a user action
in the host manager or the linked guide; nothing is installed silently.
Visual preferences use browser sync storage for the extension and may sync across
devices when browser sync is enabled. The npm plugin and static installer use
localStorage; the native source integration uses Harness's settings service.
The skin reads page markers, theme and layout to apply its UI; it does not upload
chat content. Website visits, package installation and updates still use the network.

The unchanged reference implementation under `site/` is not part of the
extension and uses public jsDelivr URLs to load its documented dependencies.
