# 🌊 Open Sea 1.2.9：在皮肤面板检查更新

打开左下角的「海洋皮肤设置」，底部就能看到当前版本和 **「检查更新」**。

## 🔔 新增功能

- **已是最新版：** 明确显示当前安装源没有可用新版。
- **发现新版：** 设置按钮出现提示点；点击 **「去更新」**，打开官方客户端的 Open Sea 详情，由你确认更新。
- **已安装但尚未生效：** 提示刷新页面或重启 Harness，避免重复安装。
- **检查失败或断网：** 显示重试提示；不会把检查失败当成已是最新版。
- **本地包 / 旧客户端 / 浏览器扩展：** 提供对应更新指南。浏览器扩展与静态安装检查 GitHub Release，npm 插件优先沿用客户端的原安装源及兼容性检查。

打开面板时检查，成功结果在当前页面缓存 6 小时；手动检查会刷新结果。无需持续后台轮询，也不会自动安装或重启客户端。原有动态海洋、Logo 和透明度设置保留。

## 📦 如何获得新版

**GitHub 1.2.9 已提供；npm 发布待完成，目前 npm 推荐安装仍是 1.2.7。** 旧版皮肤需要先更新一次，才能看到新的面板按钮。

1. 下载附件 `open-sea-skin-1.2.9.tgz`，**不要解压**。
2. 在 Harness「插件」中卸载旧版 Open Sea（仅针对本地包手动替换）。
3. 复制下载文件的完整路径，粘贴到 **「插件 → 添加插件」**，安装并启用。

Mac：Finder 选中文件按 **⌥⌘C**。Windows：资源管理器右键 **复制文件地址 / 复制为路径**，粘贴时去掉外围引号。不要粘贴远程 GitHub `.tgz` URL。

支持更新的 npm 安装不必例行卸载；新版发布到 npm 后可从官方插件详情页更新。

Chrome / Edge 用户下载附件 `open-sea-skin-extension-v1.2.9.zip`，替换原扩展目录中的文件，在扩展管理页重新加载，再刷新 Harness 页面。

[中文安装指南](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/install.zh.md) · [兼容性与测试范围](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/compatibility.md) · [版本检查隐私说明](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/privacy.md)

附件 `SHA256SUMS` 提供校验值；npm 发布将复用同一份 `.tgz`。

## ✅ 验证范围

48 项单元测试、更新面板状态与小窗口、浏览器/静态安装、官网回归通过；官方与社区桌面结构共 36 组回归通过。确切安装包在官方 0.2.2-rc.1 macOS 包内运行时中完成隔离安装、真实 Web 客户端版本查询、卸载重启与图形安装启用。原生 Windows 完整安装未实测。

## English

Adds installed-version display, update checks, available-version notices and a shortcut to the official plugin details. Checks follow the host registry and compatible version list; manual installations get instructions, while extension/static installations check GitHub Release assets. Offline failures are never reported as up to date. No automatic installation, polling or host restart. GitHub 1.2.9 is available as a local package; npm publication is pending. Earlier versions need one upgrade to get these controls. See the linked compatibility record for the actual verification scope.
