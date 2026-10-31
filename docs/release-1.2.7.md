# 🌊 Open Sea 1.2.7：新版 Harness 透明度与面板修复

**✅ v1.2.7 已在 GitHub 和 npm 发布，中国大陆镜像已同步。** 官方源、镜像与 GitHub 的下载包已核对一致。

## 📦 安装这次修复

1. 在 Harness「插件」页卸载旧版 Open Sea（如已安装）。
2. 打开「插件 → 添加插件」，输入下方包名；可选择 npm 官方源或中国大陆镜像源。
3. 安装后点击「立即启用」。出现重启提示时按提示操作。

```text
open-sea-skin@1.2.7
```

Windows / Mac 均使用以上入口，无需终端。npm 源不可用时，可下载下方 `open-sea-skin-1.2.7.tgz`，按[本地包安装步骤](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/install.zh.md#下载本地包备用)粘贴文件的完整本地路径；请勿粘贴远程 GitHub 下载链接。

[中文详细步骤](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/install.zh.md) · [English](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/dsh-plugin.md)

## 🛠️ 修复内容

- 浅色模式皮肤控制面板保持深底浅字，修复白底白字；提高设置按钮与说明文字对比度。
- 修复官方 Windows 侧栏内层重复填色；底部区域与工作区使用一致的玻璃规则。
- 适配 Harness 0.2.1-rc.5 的聊天区标记与输入框、消息气泡、代码卡片颜色变量，保留圆角与语法高亮。
- 减少海洋 Shader 的重复计算，部分采纳 @zdjmrq 的 #21 建议。原来的动态海洋、Logo 和动图均保留。

## ✅ 验证范围

官方 **0.2.1-rc.5** 的 macOS 包内运行时与真实 Web 前端完成隔离安装、加载、玻璃调节、卸载重启。浏览器回归覆盖官方 Mac/Windows 结构的 8 组组合、社区桌面结构的 24 组组合、扩展/静态安装、官网交互与加载降级。

海洋计算通过 800 个样本对比；WebGPU / WebGL2 固定场景最大通道差 1/255，未测 FPS 提速百分比。**原生 Windows 客户端尚未实测。** [完整兼容性记录](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/compatibility.md)

远景高光闪烁 #19 和独立波浪速度 #22 继续跟进，不属于本次已修复项。#16 保留开放，等待实际用户复验。

## 🔐 包完整性

版本化与不带版本号的 `.tgz` 为同一份内容，SHA-256 列在 `SHA256SUMS`。npm 发布复用了同一份 GitHub 包，没有二次打包；npm 官方源与大陆镜像均已验证 SHA-512，且下载内容与 GitHub 包逐字节一致。

Chrome/Edge 用户下载 `open-sea-skin-extension-v1.2.7.zip`；该扩展不适用于桌面客户端，不改主页或新标签页。

## English

Fixes light-mode quick-control readability, duplicate sidebar fill and newer conversation surface tokens. Reduces repeated ocean calculations without redesigning the original scene. Checked against the official packaged Harness 0.2.1-rc.5 runtime and actual Web client; native Windows E2E is not claimed. **v1.2.7 is available from npm and the mainland China mirror.** Remove an older Open Sea version in Plugins, then enter `open-sea-skin@1.2.7` in Plugins → Add plugin and enable it after installation. Both registries serve the same verified archive bytes as GitHub. The downloaded `.tgz` remains a local-path fallback.
