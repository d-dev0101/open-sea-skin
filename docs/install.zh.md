# 🖥️ Open Sea 中文安装与排错指南

[返回项目首页](../README.md#install) · [官网先看效果](https://d-dev0101.github.io/open-sea-skin/) · [English](dsh-plugin.md)

> 📦 **版本提示：GitHub v1.2.7 已提供修复包，npm 暂为 v1.2.6。** npm 新版等待维护者登录发布；需要这次透明度修复，请使用下方[本地包安装](#下载本地包备用)，不要反复安装旧包。

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
| macOS | 客户端「插件 → 添加插件」 | 官方 0.2.1-rc.5 包内运行时：隔离安装、真实 Web 页面、卸载重启；不是本次完整原生窗口实测 |
| Windows | 相同入口、相同包名 | 官方文档与实际前端安装器已核对；Windows 页面结构回归通过，尚无原生 Windows 完整安装实测 |

2026-11-01 核对的官方最新发布通道为 **0.2.1-rc.5**；完整证据和测试边界见[兼容性记录](compatibility.md)。

### 三种安装源如何填写？

客户端有 **2 个公共 npm 源 + 1 个自定义入口**。安装方法相同：在「插件 → 添加插件」填包名 **`open-sea-skin@1.2.6`**，再展开「安装源」。

1. **🌍 npm 官方源**：选择「npm 官方源」。地址是 `https://registry.npmjs.org`。
2. **🇨🇳 中国大陆镜像源**：选择「中国大陆镜像源」。地址是 `https://registry.npmmirror.com`。镜像自行同步 npm，不需要用户额外注册；新版本可能延迟。
3. **🏢 自定义地址**：选择「自定义地址」，在出现的输入框中填完整 npm 源 URL。想先验证此入口，可填 `https://registry.npmjs.org`，效果是使用官方源。企业内网请填写管理员提供、且能够代理或提供本包的地址。

填好后点击「安装」，完成后点击「立即启用」。**registry 地址不是 GitHub 地址，也不是 `.tgz` 下载链接。** 包名一栏仍填上面的包名。

| 现象 | 处理方式 |
| --- | --- |
| 公共源 404 / 找不到版本 | 核对版本是否已经发布，再切换官方源。当前 npm 已发布 1.2.6，1.2.7 仍等待发布。 |
| 自定义源 404 | 请管理员同步或代理本包；我们无法向每个私人源单独发布。也可暂时改用上述公共源。 |
| 自定义源 401 / 403 | 按该源要求在本机 `.npmrc` 配置认证（客户端提示为 `~/.npmrc`）；不要把令牌、密码拼在 URL 或公开 issue 中。 |
| 下载超时 | 换另一个公共源重试，或下载本地 `.tgz` 后粘贴文件路径安装。 |

Web 服务的两条显式选源命令（Windows PowerShell / macOS 均可，**只选一条**）：

```sh
# npm 官方源
dsh plugin --profile web add open-sea-skin@1.2.6 --registry=https://registry.npmjs.org
```

```sh
# 中国大陆镜像源
dsh plugin --profile web add open-sea-skin@1.2.6 --registry=https://registry.npmmirror.com
```

自定义 npm 源只需把 `--registry=` 后的地址换成你实际使用的源。以上 Web 命令不安装到官方客户端的 desktop 配置中；客户端用户使用图形入口即可。

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
| 左右栏深浅不一、设置看不清 | v1.2.7 修复皮肤面板白底白字、侧栏叠色及新聊天卡片透明度；广场二级弹窗修复始于 v1.2.6。需要新版时按下方本地包步骤安装，再试玻璃 40% |
| 夕阳时输入框仍是浅色 | 当前昼夜循环控制海面光照；输入框与文字主题跟随 Harness 外观设置，不自动切换明暗模式 |
| `git ls-remote` 或 SSH 报错 | 使用 npm 包名；若日志指向另一个插件，先解决该依赖的下载问题 |

> 中国大陆镜像只影响 npm 包下载。选择镜像后仍粘贴 GitHub 链接，并不会让 GitHub 下载变快。

### 下载本地包（备用）

需要 v1.2.7 修复、但 npm 新版尚未发布，或 npm 源不可用时：

1. [下载 v1.2.7 本地压缩包](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.7/open-sea-skin-1.2.7.tgz)，**保留 `.tgz`，不要解压**。
2. 已装旧版时，先在「插件」中卸载旧版 Open Sea。
3. 复制文件的完整路径：Mac 在 Finder 选中文件后按 **⌥⌘C**；Windows 在资源管理器中右键文件，选择 **「复制文件地址」**。
4. 在 Harness **「插件 → 添加插件」**粘贴该本地路径，去掉路径两端的引号，点击「安装」，完成后启用。路径中的空格可以保留。

示例格式（请粘贴自己电脑上的实际路径）：

```text
/Users/你的用户名/Downloads/open-sea-skin-1.2.7.tgz
C:\Users\你的用户名\Downloads\open-sea-skin-1.2.7.tgz
```

📌 **粘贴下载完成的本地文件路径，不是 GitHub 下载网址。** rc.5 的官方安装器支持本地 `.tgz`；Windows 支持来自源码核对，原生 Windows 安装仍未实测。新版本安装器的路径处理见[官方源码](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.5/packages/boot/plugin-manager/src/install-spec.ts)。

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
