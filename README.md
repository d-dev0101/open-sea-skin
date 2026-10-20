<div align="center">
  <img src="extension/icons/icon128.png" width="80" height="80" alt="Open Sea 海浪标志" />
  <h1>Open Sea · DeepSeek Harness 海洋皮肤</h1>
  <p><strong>让你的工作空间，拥有自己的海平线。</strong><br>动态海洋主题 · 夕阳光影 · 透明玻璃界面</p>
  <p><strong>简体中文</strong> · <a href="README.en.md">English</a></p>
  <p>
    <a href="https://github.com/d-dev0101/open-sea-skin/releases"><img src="https://img.shields.io/github/v/release/d-dev0101/open-sea-skin?color=138b8b&amp;label=GitHub%20release" alt="GitHub 最新版本" /></a>
    <a href="https://www.npmjs.com/package/open-sea-skin"><img src="https://img.shields.io/npm/v/open-sea-skin?color=138b8b&amp;label=npm" alt="npm 已发布版本" /></a>
    <a href="https://github.com/d-dev0101/open-sea-skin/actions/workflows/ci.yml"><img src="https://github.com/d-dev0101/open-sea-skin/actions/workflows/ci.yml/badge.svg" alt="构建与回归测试" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-138b8b" alt="MIT 开源许可" /></a>
  </p>
  <h2>👀 安装前，请务必先去官网看效果</h2>
  <p>调一调海浪，找一束夕阳，选一层玻璃。<br><strong>亲手体验之后，再选择适合你的安装方式。</strong></p>
  <p><a href="https://d-dev0101.github.io/open-sea-skin/"><strong>🌊 官网交互体验</strong></a> · <a href="#install">📦 安装指南</a> · <a href="https://github.com/d-dev0101/open-sea-skin/releases">🚀 下载版本</a> · <a href="https://github.com/d-dev0101/open-sea-skin/issues">💬 问题反馈</a></p>
</div>

## 🚀 官方客户端，三步开始

🖥️ **用官方客户端？直接安装 Harness 插件即可。** Windows / Mac 操作相同，不用终端，也不用先装浏览器扩展。

1. 🧩 点击侧栏 **「插件 → 添加插件」**。
2. 📋 复制下方包名，粘贴后点击 **「安装」**。
3. ✅ 安装完成后 **「立即启用」**；出现重启提示时按提示操作。

```text
open-sea-skin@1.2.6
```

🇨🇳 大陆用户可选中国大陆镜像源；找不到版本时切换官方 npm 源。

🌐 用的是 Harness Web？[跳到 Web 插件安装](#dsh-plugin)。遇到问题？[查看中文排错指南](docs/install.zh.md)。

> 💡 **只选一种安装方式。** Harness 插件和浏览器扩展是两条不同路径，不要在同一个 Harness 中重复安装。

<details>
<summary>🛍️ 已经装了社区插件市场？</summary>

搜索 **Open Sea / open-sea-skin**，核对项目为 **d-dev0101/open-sea-skin**，再检查版本并安装。

市场尚未同步时，改用官方客户端的「添加插件」。**不需要为了安装 Open Sea 先安装第三方市场。**

</details>

![Open Sea 在 DeepSeek Harness 中展示的动态海洋背景与透明聊天界面](docs/marketplace/open-sea-harness-cover.png)

**Open Sea 是为 DeepSeek Harness（DSH）制作的开源海洋皮肤与界面美化插件。**

🌊 让真实流动的海浪成为背景。<br>
🌅 从白天调到夕阳，选择你喜欢的光线。<br>
🫧 自由调节玻璃不透明度，让海洋与工作界面自然融合。

> 本项目为社区作品，**不是 DeepSeek 官方产品**。适用对象是 **DeepSeek Harness**，不是 DeepSeek 网页聊天站点；也与 OpenSea NFT 交易平台无关。

<p align="center"><a href="#features">特色功能</a> · <a href="#gallery">实拍动图</a> · <a href="#install">选择安装方式</a> · <a href="#faq">常见问题</a> · <a href="#development">开发文档</a></p>

<a id="features"></a>

## ✨ 不只是换一张壁纸

| 特色 | 你能体验到什么 |
| --- | --- |
| 🌊 实时海洋 | 实时渲染海浪与反射，不是循环播放的壁纸视频。 |
| 🌅 阳光与夕阳 | 自己选择光照，或开启 12 分钟自动昼夜循环。 |
| 🫧 透明玻璃界面 | 玻璃不透明度可在 **40%–90%** 间调整，适配 Harness 深色与浅色布局。 |
| 🎛️ 快捷调节 | 左下角打开皮肤设置，即时调整波浪、日光和透明度。 |
| 🏠 保留你的主页 | 不接管浏览器新标签页，不改掉原来安装的主页插件。 |
| 🔒 本地资源 | 海洋脚本、three.js 与字体随包提供，无皮肤遥测或运行时 CDN 请求。 |
| ⌨️ 顺手的交互 | 中英文界面、键盘操作、Esc 关闭，以及减少动态效果支持。 |

<a id="gallery"></a>

## 🎬 DeepSeek Harness 真实效果

以下动图来自原生 Harness 集成，统一为 **40% 玻璃不透明度**。全景基准：波浪大小 **56**、日光 **下午（55）**。想自己调？先打开[官网实时预览](https://d-dev0101.github.io/open-sea-skin/)。

### 🌙 深色模式 · 在海面上专注对话

![DeepSeek Harness 深色海洋主题，玻璃不透明度 40%](docs/screenshots/harness-dark-overview-40.gif)

### ☀️ 浅色模式 · 给工作空间一点阳光

![DeepSeek Harness 浅色海洋主题，玻璃不透明度 40%](docs/screenshots/harness-light-overview-40.gif)

### 🌊 调整海浪 · 从平静到涌浪

日光固定为下午，波浪大小变化后回到基准值 56。

![在 DeepSeek Harness 皮肤设置中调整海浪大小](docs/screenshots/harness-wave-control-40.gif)

### 🌅 调整光照 · 从正午走向夕阳

波浪固定为 56，日光从正午平滑变化到黄昏。

![将 DeepSeek Harness 动态海洋背景从白天调整到夕阳](docs/screenshots/harness-daylight-sunset-40.gif)

<a id="install"></a>

## 📦 安装指南 · 只选一种方式

| 编号 | 你在用什么？ | 从这里开始 |
| --- | --- | --- |
| **1 🖥️ 推荐** | **官方客户端 · Windows / Mac** | [客户端内安装，无需终端](#official-desktop) |
| **2 🌐 插件** | 浏览器里运行的 Harness Web | [在运行 Harness 的电脑上安装](#dsh-plugin) |
| **3 🧩 扩展** | 本机 Harness Web，想用浏览器扩展换肤 | [安装 Chrome / Edge 扩展](#browser-extension) |
| **4 🔧 进阶** | 不支持插件的已构建前端 | [静态前端安装](#static-installer) |
| **5 🛠️ 开发者** | 自己编译 Harness 源码 | [原生源码接入](#source-integration) |

<a id="official-desktop"></a>

### 1. 🖥️ 官方客户端（Windows / Mac）——优先推荐

**Windows 和 Mac 使用相同的界面步骤，不需要安装 Node.js，也不需要打开终端。**

1. 打开 DeepSeek Harness，点击左侧 **「插件」**，再点 **「添加插件」**。
2. 复制下面这一行，粘贴到插件名称输入框：

   ```text
   open-sea-skin@1.2.6
   ```

3. 中国大陆用户可选择 **「中国大陆镜像源」**；下载失败时可切换 **「官方 npm 源」**。
4. 点击 **「安装」**，检查安装信息，完成后点击 **「立即启用」**；如果客户端提示重启，按提示操作。
5. 点击左下角 **「皮肤设置」**，建议先试 **40% 玻璃不透明度**。

> 💡 入口是侧栏的「插件」，不是「设置 → 内置插件」。安装时填写包名，不要填写 GitHub 仓库或远程压缩包链接。

#### 🔄 更新、暂停与卸载

- **更新旧版：** 在「插件」页卸载旧版 Open Sea，再按上述步骤安装。已核对的官方安装器暂不支持第三方插件原地升级。
- **暂时关闭：** 在皮肤面板关闭海洋，或在「插件」页停用 Open Sea。
- **完整卸载：** 在「插件」页找到 Open Sea，选择卸载。无需运行 Web 卸载命令。

> 🛟 不要删除整个 Harness 配置目录、会话目录或锁文件。安装报错时先看[中文恢复与排错指南](docs/install.zh.md)。

📖 [Windows / Mac 中文详细指南与常见报错](docs/install.zh.md) · [下载官方客户端](https://github.com/deepseek-ai/deepseek-harness/releases)

<a id="dsh-plugin"></a>

### 2. 🌐 Harness Web ——一条命令安装

在启动 `dsh web` 的那台电脑上运行。Windows PowerShell 与 macOS 终端使用同一条命令：

```sh
dsh plugin --profile web add open-sea-skin@1.2.6
```

安装完成后，重启正在运行的 `dsh web`，刷新浏览器页面。
这个入口只安装到 Web 配置，**不会给官方客户端安装插件**。

📖 [Web 安装与排错](docs/dsh-plugin.md)

<a id="browser-extension"></a>

### 3. 🧩 Chrome / Edge 浏览器扩展

适用于在浏览器中打开的本机 Harness，Windows / Mac 均可使用。

1. [下载扩展 ZIP](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.6/open-sea-skin-extension-v1.2.6.zip)，先解压。
2. 打开 `chrome://extensions` 或 `edge://extensions`，开启 **「开发者模式」**。
3. 点击 **「加载已解压的扩展程序」**，选择包含 `manifest.json` 的目录。
4. 回到 `127.0.0.1` 或 `localhost` 上的 Harness 页面，刷新一次。

🏠 保留你原来的主页和新标签页插件。浏览器扩展不会安装到官方桌面客户端里。

<a id="static-installer"></a>

### 4. 🔧 静态前端安装（进阶备用）

<details>
<summary>仅当你的已构建 Harness 前端不支持插件时，展开操作</summary>

此方式会修改前端文件。先停止 Harness，[查看脚本](install.sh)，再在 **macOS / Linux 的 Bash** 中执行：

```sh
curl -fsSL https://raw.githubusercontent.com/d-dev0101/open-sea-skin/main/install.sh | bash
```

随后重新启动 `dsh web`。Harness 前端升级后，使用 `bash -s -- --update` 重新应用皮肤。
**不是 Windows PowerShell 命令，也不适用于修改官方桌面客户端安装目录。**

📖 [指定路径、备份与恢复](native-dist/README.md)

</details>

<a id="source-integration"></a>

### 5. 🛠️ Harness 源码接入（开发者）

<details>
<summary>仅当你自己开发、编译 Harness 时，展开说明</summary>

可将海洋控制接入 Harness 的设置与插槽，需要自行构建前后端。
验证基线是 `0.1.2-alpha.3`，不是适用于所有新版的一键安装方案。

📖 [原生源码接入指南](harness-plugin/README.md)

</details>

<a id="faq"></a>

## 💡 安装前，你可能想知道

<details>
<summary><strong>会替换浏览器新标签页，或者修改 DeepSeek 网页版吗？</strong></summary>

不会。扩展只作用于经过验证的本地 DeepSeek Harness 页面，不接管浏览器主页，也不会为 `chat.deepseek.com` 换肤。

</details>

<details>
<summary><strong>如何关闭或卸载？</strong></summary>

**官方客户端：** 在左侧「插件」中停用或卸载 Open Sea。

**Harness Web：** 临时关闭可用快捷面板；卸载使用：

```sh
dsh plugin --profile web remove open-sea-skin
```

随后重启 Harness。浏览器扩展可在扩展管理页移除。静态安装用户先停止 Harness，再运行：

```sh
curl -fsSL https://raw.githubusercontent.com/d-dev0101/open-sea-skin/main/install.sh | bash -s -- --uninstall
```

之后重新启动 Harness。静态卸载器删除自己的加载标记与资源，不删除你的会话。页面无法加载时，请参阅[恢复指南](native-dist/README.md)。

</details>

<details>
<summary><strong>是否保证兼容所有最新版 Harness / Desktop？</strong></summary>

不做全版本兼容承诺。原生源码集成的验证基线为 Harness `0.1.2-alpha.3`、提交 `dd6322d60`（2026 年 8 月 31 日）。**官方 macOS Desktop `0.2.0-rc.2`** 已在隔离配置中实装 v1.2.5 并目视验证。社区 DSH Desktop Beta `2.0.5-beta.1` 有 24 组外壳回归组合；官方 0.2.x 的 macOS/Windows 页面结构也加入了浏览器回归测试。Windows 原生 Desktop 尚未完成端到端测试。

如果升级后遇到问题，请[提供 Harness 版本、安装方式，以及去除敏感信息的截图或日志](https://github.com/d-dev0101/open-sea-skin/issues)。

</details>

<details>
<summary><strong>会占用很多性能吗？聊天数据安全吗？</strong></summary>

渲染器支持自适应分辨率、隐藏标签页暂停和减少动态效果。动态 3D 海洋仍会使用 GPU，建议先在官网用自己的设备体验。

皮肤不收集或上传聊天数据；扩展权限仅用于存储设置和访问本地 Harness。这描述的是 Open Sea，不代表宿主应用自身的数据处理行为。[隐私与权限说明 →](docs/privacy.md)

</details>

## 🔒 权限与隐私

Open Sea 没有聊天数据上传或分析功能。安装版的海洋渲染脚本、three.js 与字体随包提供。
浏览器扩展读取页面标记以识别 Harness，并修改界面样式；视觉偏好使用 Chrome / Edge 的同步存储，开启浏览器同步时可能跨设备同步。
仓库里的旧版 `site/` 演示会从 jsDelivr 加载依赖，不属于安装包或当前官网。详见[中文隐私说明](docs/privacy.md)。

<a id="development"></a>

## 🛠️ 开发与开源生态

基于 **WebGPU、three.js 与 TSL**，包含五组 Gerstner 波、海面反射、泡沫与天空光照。共享源码位于 `shared/`，生成的插件、扩展和静态加载器保持同步；`site/` 保留最初版展示。

使用 Node.js 20+：

```sh
npm ci
npm run build
npm run check
npx playwright install chromium
npm run test:browser
npm run test:desktop
npm run test:website
```

| 快捷文档 | 内容 |
| --- | --- |
| [技术架构](docs/architecture.md) | 渲染器、共享控制器与安装适配 |
| [原生源码集成](harness-plugin/README.md) | Harness 设置与 slots 接入、兼容基线 |
| [发布指南](docs/releasing.md) | 打包与发布流程 |
| [更新日志](CHANGELOG.md) | 版本变化与修复记录 |
| [Issues / Pull requests](https://github.com/d-dev0101/open-sea-skin/issues) | 报错、建议与参与贡献 |
| [DSH 插件目录](https://github.com/topics/dsh-plugin) | 探索社区插件生态 |

## 🤝 反馈与许可

💬 **遇到问题？欢迎用中文提问。** [提交 Issue](https://github.com/d-dev0101/open-sea-skin/issues/new) 时，附上以下信息，方便定位：

- 🖥️ 系统：Windows / macOS，以及 Harness 版本。
- 📦 安装：皮肤版本、安装方式（客户端插件 / Web 插件 / 浏览器扩展等）。
- 🔎 现象：操作步骤、报错原文，以及去除敏感信息的截图。

🔐 请勿公开密码、Token 或私人对话。<br>
💡 有改进建议也欢迎交流；想参与开发，可提交 [Pull request](https://github.com/d-dev0101/open-sea-skin/pulls)。

项目代码使用 [MIT 开源许可](LICENSE)，第三方代码与字体遵循各自许可，详见[第三方声明](THIRD_PARTY_NOTICES.md)。

<p align="center"><a href="https://d-dev0101.github.io/open-sea-skin/"><strong>🌊 找到你的那片海，先去官网试试看</strong></a></p>
