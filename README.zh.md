<div align="center">
  <img src="extension/icons/icon128.png" width="80" height="80" alt="Open Sea 海浪标志" />
  <h1>Open Sea · DeepSeek Harness 海洋皮肤</h1>
  <p><strong>让你的工作空间，拥有自己的海平线。</strong><br>动态海洋主题 · 夕阳光影 · 透明玻璃界面</p>
  <p><strong>简体中文</strong> · <a href="README.md">English</a></p>
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

![Open Sea 在 DeepSeek Harness 中展示的动态海洋背景与透明聊天界面](docs/marketplace/open-sea-harness-cover.png)

**Open Sea 是为 DeepSeek Harness（DSH）制作的开源海洋皮肤与界面美化插件。** 它将实时 WebGPU 动态背景、可调海浪、白天到夕阳的光照，以及半透明玻璃界面带进你的工作空间。支持 DSH 插件、仅作用于 Harness 的 Chrome / Edge 扩展，以及静态前端集成。

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

## 📦 选择适合你的安装方式

**选一种即可。** 不建议叠加安装，避免增加更新与排障的复杂度。

| 你正在使用 | 建议入口 |
| --- | --- |
| Harness Web / DSH 插件安装器 | [DSH 插件](#dsh-plugin) |
| Chrome / Edge 中的本地 Harness | [浏览器扩展](#browser-extension) |
| 不支持插件的已构建前端 | [静态安装器](#static-installer) |
| 自行开发 Harness 源码集成 | [原生源码接入指南](harness-plugin/README.md) |

<a id="dsh-plugin"></a>

### 1. DSH 插件

**版本状态（2026 年 9 月 12 日核对）：** GitHub 已发布 **v1.2.4**，npm 仍为 **1.2.3**。语言切换修复包含在 v1.2.4 中；npm 正式发布前，请不要使用 `open-sea-skin@1.2.4` 命令。

安装已发布的 npm 预构建包，无需 Git 下载或安装时编译：

```sh
dsh plugin --profile web add open-sea-skin@1.2.3
```

如果需要 v1.2.4 的语言切换修复，可安装已发布的 GitHub 标签：

```sh
dsh plugin --profile web add 'github:d-dev0101/open-sea-skin#v1.2.4'
```

安装后重启 Harness、刷新页面，再点击左下角的**皮肤设置**。DSH Desktop 用户可通过托管插件安装器安装，并从桌面设置重启；市场能提供的更新版本取决于目录同步与安装来源。

[安装验证与故障排查 →](docs/dsh-plugin.md)

<a id="browser-extension"></a>

### 2. Chrome / Edge 扩展

1. [下载扩展 ZIP](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.4/open-sea-skin-extension-v1.2.4.zip) 并解压。
2. 打开 `chrome://extensions` 或 `edge://extensions`，开启**开发者模式**。
3. 点击**加载已解压的扩展程序**，选择包含 `manifest.json` 的解压目录；如果克隆了仓库，则选择 `extension/`。
4. 打开 `127.0.0.1` 或 `localhost` 上的 Harness，刷新一次。

**你的新标签页仍然属于你。** 扩展会先验证是否为 Harness 页面；不会接管主页，也不会修改其他本地开发网站。

<a id="static-installer"></a>

### 3. 静态前端安装器

适用于无法使用插件的已构建 Harness 前端。**先停止 Harness**，可先[查看脚本](install.sh)，然后在任意目录运行：

```sh
curl -fsSL https://raw.githubusercontent.com/d-dev0101/open-sea-skin/main/install.sh | bash
```

完成后重新启动 `dsh web` 并保持运行。每次升级 Harness 前端后，将命令末尾改为 `bash -s -- --update` 再执行。此方式会修改前端文件，不负责启动服务。

[手动指定前端路径、备份与恢复 →](native-dist/README.md)

<a id="faq"></a>

## 💡 安装前，你可能想知道

<details>
<summary><strong>会替换浏览器新标签页，或者修改 DeepSeek 网页版吗？</strong></summary>

不会。扩展只作用于经过验证的本地 DeepSeek Harness 页面，不接管浏览器主页，也不会为 `chat.deepseek.com` 换肤。

</details>

<details>
<summary><strong>如何关闭或卸载？</strong></summary>

临时关闭：在快捷面板中关闭海洋皮肤。卸载 DSH 插件：

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

不做全版本兼容承诺。原生源码集成的验证基线为 Harness `0.1.2-alpha.3`、提交 `dd6322d60`（2026 年 8 月 31 日）。桌面回归使用基于 DSH Desktop Beta `2.0.5-beta.1` 的 Chromium 外壳测试页面，覆盖 24 组布局、材质、明暗与透明度组合，不等同于完整原生桌面端到端测试。

如果升级后遇到问题，请[提供 Harness 版本、安装方式，以及去除敏感信息的截图或日志](https://github.com/d-dev0101/open-sea-skin/issues)。

</details>

<details>
<summary><strong>会占用很多性能吗？聊天数据安全吗？</strong></summary>

渲染器支持自适应分辨率、隐藏标签页暂停和减少动态效果。动态 3D 海洋仍会使用 GPU，建议先在官网用自己的设备体验。

皮肤不收集或上传聊天数据；扩展权限仅用于存储设置和访问本地 Harness。这描述的是 Open Sea，不代表宿主应用自身的数据处理行为。[隐私与权限说明 →](docs/privacy.md)

</details>

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

为想要个性化 DeepSeek Harness 工作空间的人而做。欢迎提交建议、反馈问题或贡献代码；请勿在 Issue 中公开密码、Token 或私人对话。

项目代码使用 [MIT 开源许可](LICENSE)，第三方代码与字体遵循各自许可，详见[第三方声明](THIRD_PARTY_NOTICES.md)。

<p align="center"><a href="https://d-dev0101.github.io/open-sea-skin/"><strong>🌊 找到你的那片海，先去官网试试看</strong></a></p>
