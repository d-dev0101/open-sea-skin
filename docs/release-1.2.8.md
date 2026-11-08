# 🌊 Open Sea 1.2.8：对话输入区与后台恢复修复

**GitHub 修复包已提供；npm / 中国大陆镜像目前仍为 1.2.7。** 请勿尝试安装尚未发布的 `open-sea-skin@1.2.8`。npm 发布完成后会更新本说明。

## 🛠️ 本次修复

- 进入已有对话时，输入框外层不再多叠一层渐变，消除由此产生的深色条或白色块。只修改聊天区域的稳定标记，保留卡片圆角、气泡和代码背景。感谢 #25 / #27 的复现与分析。
- 从后台恢复后重新开始帧率采样，避免把隐藏时间当作掉帧；低帧率模式能在稳定渲染后逐步恢复清晰度。
- WebGL2 回退保留系统“减少动态效果”的帧率与像素预算。
- 安装说明跟进官方 Harness 0.2.2-rc.1 新增的 registry 插件更新功能。原动态海洋、Logo 与演示动图保留。

## 📦 如何安装修复包

1. 下载附件 **`open-sea-skin-1.2.8.tgz`**，保持 `.tgz` 格式，不要解压。
2. 如已安装旧版 Open Sea，先在「插件」页卸载该插件，再安装本地修复包。此步骤仅针对本地包替换；支持更新的 npm 安装无需一律先卸载。
3. Mac 在 Finder 选中文件，按 **Option–Command–C**；Windows 在资源管理器使用 **复制文件地址 / 复制为路径**。
4. 将完整本地路径粘贴到 Harness「插件 → 添加插件」，去掉外围引号，安装后启用。请勿粘贴远程 GitHub `.tgz` 下载 URL。

想继续使用 npm 安装，可暂用已发布的 `open-sea-skin@1.2.7`。官方客户端中选择 npm 官方源或中国大陆镜像均可；自定义源取决于该源是否同步本包。

[中文安装指南](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/install.zh.md) · [English](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/dsh-plugin.md)

Chrome / Edge 扩展用户下载 **`open-sea-skin-extension-v1.2.8.zip`**。扩展不适用于桌面客户端，也不更换浏览器主页或新标签页。

## ✅ 测试与仍在跟进

官方 Harness **0.2.2-rc.1** macOS 包内运行时与真实 Web 客户端完成隔离安装、加载、浅深色调节和卸载重启；原生 Windows 窗口尚未测试。官方桌面结构 12 组及社区桌面结构 24 组回归通过；新增后台恢复、分辨率恢复及减少动态效果预算测试。

Windows 原生标题栏色块 #27、Mac GPU 占用与节能档 #28、远景闪烁 #19、独立波浪速度 #22 继续跟进，不计入全部已解决项。[详细兼容性记录](https://github.com/d-dev0101/open-sea-skin/blob/main/docs/compatibility.md)

## 🔐 包校验

附件的校验值列在 `SHA256SUMS`。发布至 npm 时会复用同一份 GitHub `.tgz`，核对 registry integrity 与 SHA-256，避免重新打包造成差异。

## English

Fixes the duplicated sticky-composer gradient on official Desktop layouts and rendering-scheduler recovery. Keeps the original scene, card radii and reduced-motion budgets. Verified against the official Harness 0.2.2-rc.1 packaged macOS Host and actual Web client; this is not native Windows E2E. **GitHub 1.2.8 is available as a local tarball; npm remains at 1.2.7 until publication is completed.** Download the archive, replace the old plugin through Plugins → Add plugin using its full local path, then enable it. Use the registry update action for registry-installed versions when available.
