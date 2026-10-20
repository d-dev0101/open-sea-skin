# 🖥️ Open Sea 中文安装与排错指南

[返回项目首页](../README.md#install) · [官网先看效果](https://d-dev0101.github.io/open-sea-skin/) · [English](dsh-plugin.md)

## 1. 官方客户端：Windows / Mac

1. 打开 DeepSeek Harness 左侧的 **「插件」**。
2. 点击 **「添加插件」**。如果看到下拉菜单，选择安装第三方插件。
3. 输入 `open-sea-skin@1.2.6`。
4. 中国大陆用户可在「安装源」选择「中国大陆镜像源」，也可以用官方 npm 源。
5. 点击「安装」，完成后选择「立即启用」。如有重启提示，按客户端提示操作。
6. 打开左下角的「皮肤设置」，试试 40% 玻璃不透明度。

**包名不是终端命令。** 直接填在客户端的输入框里；不需要另装 Node.js、pnpm 或浏览器扩展。

| 系统 | 安装入口 | 验证情况 |
| --- | --- | --- |
| macOS | 客户端「插件 → 添加插件」 | 官方 0.2.0-rc.2 的隔离配置安装与界面目视验证；npm 官方源与大陆镜像均验证过 |
| Windows | 相同入口、相同包名 | 官方安装文档支持此入口；Windows 页面结构有回归测试，尚无维护者的 Windows 原生完整安装实测 |

截至 2026-10-20，官方最新预发布为 [0.2.1-rc.2](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.2.1-rc.2)。已核对该版本的[中文插件管理说明](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.2/packages/client/ui-plugin-manager/README.zh.md)与语义弹窗结构，这不等同于完成该版本的实机兼容测试。

### 插件市场、npm 和浏览器扩展有什么区别？

- **官方客户端添加插件：首选。** 输入 npm 包名，让客户端负责下载和启用。
- **社区插件市场：可选入口。** 搜索 Open Sea，核对仓库 `d-dev0101/open-sea-skin` 和版本。市场数据可能滞后；未同步时用官方客户端直接安装。不必先装市场才能装皮肤。
- **Harness Web：同一个 npm 插件。** 在运行 Web 服务的电脑安装，不是在访问它的另一台电脑上安装。
- **Chrome / Edge 扩展：另一条路径。** 仅作用于识别到的浏览器 Harness 页面，不能给桌面客户端换肤；不改浏览器主页。

同一实例只选一种方式。切换方式时，先停用原来的皮肤集成，避免重复注入。

### 更新、停用、卸载

- **更新 Open Sea：** 先在「插件」中卸载旧版，再输入准确的新版本包名安装。已核对的安装器暂不提供第三方插件原地升级。
- **临时关闭：** 在皮肤面板关闭海洋，或在「插件」中停用。
- **卸载：** 在「插件」页找到 Open Sea，选择卸载。不要删除整个 `.dsh` 配置或会话目录。
- **升级 Harness：** 无需例行卸载皮肤。更新后检查明暗模式、设置弹窗与左右栏；如异常，先在「插件」里停用 Open Sea，再反馈版本及截图。

## 2. 常见情况

| 你看到的现象 | 怎么处理 |
| --- | --- |
| 「设置 → 内置插件」只有内置条目 | 退出设置，打开左侧「插件」，第三方安装入口在这里 |
| 下载很慢，日志反复出现 GitHub `HEAD` 请求 | 取消这次安装，改填 `open-sea-skin@1.2.6`，选择合适的 npm 源 |
| `ERR_PNPM_MISSING_TARBALL_INTEGRITY` | 远程 `.tgz` 的已报告安装问题；改按 npm 包名安装，不要删 lockfile 来碰运气 |
| 大陆镜像找不到新版本 | 切换官方 npm 源；镜像同步有延迟，不要改成 GitHub URL |
| 安装后没有海洋 | 先确认已「启用」；按客户端提示重启；检查是否把插件装在 Web 而不是客户端里 |
| 左右栏深浅不一、设置看不清 | 左右栏与主设置修复在 v1.2.5；广场浮层与二级配置弹窗修复在 v1.2.6。升级后先试玻璃 40%，记录明暗模式、系统、Harness 版本后反馈 |
| 夕阳时输入框仍是浅色 | 当前昼夜循环控制海面光照；输入框与文字主题跟随 Harness 外观设置，不自动切换明暗模式 |
| `git ls-remote` 或 SSH 报错 | 使用 npm 包名；若日志指向另一个插件，先解决该依赖的下载问题 |

> 中国大陆镜像只影响 npm 包下载。选择镜像后仍粘贴 GitHub 链接，并不会让 GitHub 下载变快。

### 下载本地包（备用）

优先使用上面的客户端安装入口。两个 npm 源都不可用时，可[下载 v1.2.6 压缩包](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.6/open-sea-skin-1.2.6.tgz)。

**macOS：** 保存到「下载」，完全退出客户端，再在终端运行：

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add "$HOME/Downloads/open-sea-skin-1.2.6.tgz"
```

这是默认 macOS 安装位置的备用命令。Windows 不要复制这条命令；若图形安装入口不可用，请附安装日志反馈，避免猜测客户端运行时路径。

## 3. Harness Web

仅在运行 `dsh web` 的电脑执行，Windows PowerShell 和 macOS 终端通用：

```sh
dsh plugin --profile web add open-sea-skin@1.2.6
```

重启正在运行的 `dsh web`，再刷新浏览器。卸载时将 `add open-sea-skin@1.2.6` 换成 `remove open-sea-skin`。

## 4. 给维护者的信息

请提供：Windows / macOS 版本、Harness 版本、Open Sea 版本、上述哪种安装方式，以及错误发生时的完整日志或截图。日志请移除令牌和私人对话。

需要核对包校验信息的进阶用户可运行：

```sh
npm view open-sea-skin@1.2.6 dist.integrity --registry=https://registry.npmjs.org
```

这条命令读取 registry 公布的完整性信息；安装器负责验证下载内容，并不意味着包已通过独立安全审计。
