<div align="center">
  <img src="extension/icons/icon128.png" width="80" height="80" alt="Open Sea wave logo" />
  <h1>Open Sea Skin · DeepSeek Harness Ocean Theme</h1>
  <p><strong>A living ocean behind your workspace.</strong><br>Animated waves · Sunset lighting · Translucent glass</p>
  <p><a href="README.md">简体中文</a> · <strong>English</strong></p>
  <p>
    <a href="https://github.com/d-dev0101/open-sea-skin/releases"><img src="https://img.shields.io/github/v/release/d-dev0101/open-sea-skin?color=138b8b&amp;label=GitHub%20release" alt="Latest GitHub release" /></a>
    <a href="https://www.npmjs.com/package/open-sea-skin"><img src="https://img.shields.io/npm/v/open-sea-skin?color=138b8b&amp;label=npm" alt="Published npm version" /></a>
    <a href="https://github.com/d-dev0101/open-sea-skin/actions/workflows/ci.yml"><img src="https://github.com/d-dev0101/open-sea-skin/actions/workflows/ci.yml/badge.svg" alt="Build and regression tests" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-138b8b" alt="MIT license" /></a>
  </p>
  <h2>👀 Before installing, try the live website</h2>
  <p>Move the waves. Find your sunset. Tune the glass.<br><strong>Preview the skin yourself before choosing an installation method.</strong></p>
  <p><a href="https://d-dev0101.github.io/open-sea-skin/"><strong>🌊 Interactive demo</strong></a> · <a href="#install">📦 Install</a> · <a href="https://github.com/d-dev0101/open-sea-skin/releases">🚀 Releases</a> · <a href="https://github.com/d-dev0101/open-sea-skin/issues">💬 Get help</a></p>
</div>

## 🌊 See the ocean in motion

![Open Sea animated ocean inside DeepSeek Harness in dark mode at 40 percent glass opacity](docs/screenshots/harness-dark-overview-40.gif)

🎬 Original Harness recording · 40% glass opacity · [Light mode, waves & sunset](#gallery) · [Try the interactive website](https://d-dev0101.github.io/open-sea-skin/)

## 🛠️ Maintenance status

**✅ v1.2.7 is available from npm and the mainland China mirror.** It fixes the light-mode controls, stacked sidebar fill and newer conversation surfaces. Copy the package name below to install. If an older version is installed, remove it in **Plugins** before installing the update.

🔎 Checked official Harness **0.2.1-rc.5** using the packaged Mac runtime and actual Web client, including install/remove and both themes. **Native Windows Desktop remains untested.** [Compatibility evidence & known issues →](docs/compatibility.md)

## 🚀 Official Desktop in three steps

🖥️ **Using Official Desktop? Install the Harness plugin directly.** The same steps work on Windows and Mac. No terminal or browser extension required.

1. 🧩 Open **Plugins → Add plugin** in the sidebar.
2. 📋 Paste the package name below and click **Install**.
3. ✅ Choose **Enable now**, then restart if prompted.

```text
open-sea-skin@1.2.7
```

🇨🇳 The mainland China mirror is optional; switch to the official npm registry if the version is not available.

🌐 Using Harness Web? [Go to Web installation](#dsh-plugin). Need help? [Read the plugin guide](docs/dsh-plugin.md).

> 💡 **Choose one integration.** The Harness plugin and browser extension are alternatives. Do not install both in the same Harness instance.

<details>
<summary>🛍️ Already using a community plugin market?</summary>

Search for **Open Sea / open-sea-skin**, verify the repository is **d-dev0101/open-sea-skin**, and check the version.

If the listing is outdated, use Official Desktop's **Add plugin** instead. Installing a community market is not required.

</details>

**Open Sea Skin is an open-source ocean theme and appearance plugin for DeepSeek Harness (DSH).** It adds a real-time WebGPU animated background, adjustable waves, daylight-to-sunset lighting, and a translucent glass interface. Use it as a DSH plugin, a Harness-only Chrome/Edge extension, or a static frontend integration.

> Community-made, not an official DeepSeek product. This skin targets **DeepSeek Harness**, not the DeepSeek chat website. It is unrelated to the OpenSea NFT marketplace.

<p align="center"><a href="#features">Features</a> · <a href="#gallery">Gallery</a> · <a href="#install">Installation</a> · <a href="#faq">FAQ</a> · <a href="#development">Development</a></p>

<a id="features"></a>

## ✨ Your workspace, your sea

| Feature | What you can do |
| --- | --- |
| 🌊 Real-time ocean | Watch animated waves and reflections, rather than a looping wallpaper video. |
| 🌅 Daylight & sunset | Set your own light or enable the twelve-minute day/night cycle. |
| 🫧 Transparent interface | Adjust glass opacity from **40% to 90%** in light or dark Harness layouts. |
| 🎛️ Quick controls | Change sea state, sunlight and opacity from the lower-left skin settings panel. |
| 🏠 Your homepage stays yours | The extension does not replace new tabs or change your browser homepage. |
| 🔒 Local assets | Ocean scripts, three.js and fonts ship with the skin; no skin analytics or runtime CDN requests. |
| ⌨️ Thoughtful controls | Chinese/English UI, keyboard navigation, Escape to close, and reduced-motion support. |

<a id="gallery"></a>

## 🎬 Open Sea inside DeepSeek Harness

These recordings show the native Harness integration at **40% glass opacity**. Overview settings: wave size **56**, daylight **Afternoon (55)**. The [interactive website](https://d-dev0101.github.io/open-sea-skin/) lets you try the controls before installing.

### 🌙 Dark mode · an ocean behind your conversation

![DeepSeek Harness dark ocean theme with transparent panels at 40 percent glass opacity](docs/screenshots/harness-dark-overview-40.gif)

### ☀️ Light mode · a brighter workspace

![DeepSeek Harness light ocean theme with transparent panels at 40 percent glass opacity](docs/screenshots/harness-light-overview-40.gif)

### 🌊 Wave control · calm water to high sea

Daylight stays at Afternoon while wave size changes, then returns to 56.

![Adjusting the Open Sea wave-size slider inside DeepSeek Harness](docs/screenshots/harness-wave-control-40.gif)

### 🌅 Sunlight control · midday to sunset

Wave size stays at 56 while the light moves from Midday to Dusk.

![Changing DeepSeek Harness ocean background lighting from daylight to sunset](docs/screenshots/harness-daylight-sunset-40.gif)

<a id="install"></a>

## 📦 Choose one installation path

| # | Your setup | Start here |
| --- | --- | --- |
| **1 🖥️ Recommended** | **Official Desktop · Windows / Mac** | [Install inside the app](#official-desktop) |
| **2 🌐** | Harness Web | [One CLI command](#dsh-plugin) |
| **3 🧩** | Local Harness in Chrome / Edge | [Browser extension](#browser-extension) |
| **4 🔧 Advanced** | Built frontend without plugin support | [Static installer](#static-installer) |
| **5 🛠️ Developer** | A Harness source checkout | [Source integration](#source-integration) |

<a id="official-desktop"></a>

### 1. 🖥️ Official Desktop · Windows / Mac — recommended

**The same UI steps apply on Windows and Mac. No terminal or separate Node.js installation is required.**

1. Open **Plugins** in the sidebar, then **Add plugin**.
2. Paste this exact package name and version:

   ```text
   open-sea-skin@1.2.7
   ```

3. Choose the official npm registry, or the mainland China mirror if that works better on your network.
4. Select **Install**, review the package details, then **Enable now**. Restart if the app requests it.
5. Open the lower-left **Skin settings** control and try **40% glass opacity**.

> 💡 Use the sidebar's Plugins page, not Settings → Built-in plugins. Enter the package name rather than a GitHub repository or remote tarball URL.

#### 🌐 All three installation-source options

**Enter `open-sea-skin@1.2.7` as the package name. Choose or enter the registry separately under Installation source.** The UI flow is the same on Mac and Windows.

| Source option | Registry URL | When to use it |
| --- | --- | --- |
| **🌍 Official npm** | `https://registry.npmjs.org` | The upstream publication source. |
| **🇨🇳 Mainland China mirror** | `https://registry.npmmirror.com` | An alternative for mainland networks; new versions may arrive later. |
| **🏢 Custom address** | Your npm registry URL; `https://registry.npmjs.org` also works as a custom value | For a company/private proxy. This is an input option, not a third predefined public mirror; it must serve or proxy this package. |

Verified on **November 1, 2026**: both public sources serve **1.2.7**, with archive bytes matching the GitHub Release. Use the [local-package fallback](docs/dsh-plugin.md#local-package-fallback) if registries are unavailable. Registry selection does not redirect a GitHub URL. For custom-registry 401/403 errors, follow that registry's authentication requirements.

**Update:** uninstall the older Open Sea version in Plugins, then install the version above. The reviewed official installer does not update third-party bundles in place.
**Disable:** turn off the ocean in the skin controls, or disable Open Sea in Plugins.
**Uninstall:** remove Open Sea from Plugins. Web-profile commands do not remove Desktop plugins.

📖 [Detailed guide and troubleshooting](docs/dsh-plugin.md#dsh-desktop) · [Official Desktop downloads](https://github.com/deepseek-ai/deepseek-harness/releases)

<a id="dsh-plugin"></a>

### 2. 🌐 Harness Web

Run this on the machine that runs `dsh web`. The command is the same in Windows PowerShell and the macOS terminal:

```sh
dsh plugin --profile web add open-sea-skin@1.2.7
```

Restart your running `dsh web` process and reload the browser. This installs into the Web profile, **not Official Desktop**.

📖 [Web installation and troubleshooting](docs/dsh-plugin.md)

<a id="browser-extension"></a>

### 3. 🧩 Chrome / Edge extension

For local Harness pages in a browser, on Windows or Mac.

1. [Download the extension ZIP](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.7/open-sea-skin-extension-v1.2.7.zip) and unzip it.
2. Open `chrome://extensions` or `edge://extensions`; enable **Developer mode**.
3. Choose **Load unpacked** and select the extracted folder containing `manifest.json`.
4. Reload your Harness page on `127.0.0.1` or `localhost`.

🏠 Your homepage and new-tab extension stay unchanged. This extension does not install into the desktop app.

<a id="static-installer"></a>

### 4. 🔧 Static frontend installer · advanced fallback

<details>
<summary>For built Harness frontends without plugin support</summary>

This changes frontend files. Stop Harness, [review the script](install.sh), and run in **Bash on macOS / Linux**:

```sh
curl -fsSL https://raw.githubusercontent.com/d-dev0101/open-sea-skin/main/install.sh | bash
```

Restart `dsh web`. Reapply with `bash -s -- --update` after a Harness frontend upgrade.
This is **not a Windows PowerShell command or a way to patch Official Desktop's installation folder**.

📖 [Paths, backups and recovery](native-dist/README.md)

</details>

<a id="source-integration"></a>

### 5. 🛠️ Harness source integration · developers

<details>
<summary>For developers building Harness from source</summary>

Integrates with Harness settings and slots; requires building the frontend and backend.
The tested source baseline is `0.1.2-alpha.3`, not every newer Harness version.

📖 [Native source integration](harness-plugin/README.md)

</details>

<a id="faq"></a>

## 💡 Before you install

<details>
<summary><strong>Does this change my new-tab page or the DeepSeek website?</strong></summary>

No. The extension targets a verified local DeepSeek Harness page. It does not replace your browser homepage or skin `chat.deepseek.com`.

</details>

<details>
<summary><strong>How do I disable or uninstall the skin?</strong></summary>

For **Official Desktop**, disable or uninstall Open Sea in the sidebar Plugins page.

For **Harness Web**, turn off the ocean in the quick-controls panel, or remove the plugin with:

```sh
dsh plugin --profile web remove open-sea-skin
```

Restart Harness. Remove the browser extension through the browser's extensions page. For a static installation, stop Harness and run:

```sh
curl -fsSL https://raw.githubusercontent.com/d-dev0101/open-sea-skin/main/install.sh | bash -s -- --uninstall
```

Then restart Harness. The static installer removes its own marked loader/assets, not your sessions. See the [recovery guide](native-dist/README.md) if a page fails to load.

</details>

<details>
<summary><strong>Is every latest Harness/Desktop version tested?</strong></summary>

The current release channel, **0.2.1-rc.5**, was checked with the official packaged macOS runtime in an isolated profile: package installation, actual Web client loading, skin controls, uninstall and restart. Browser regressions cover macOS/Windows shell structures, both themes and 40%/90% glass. **This is not native Windows Desktop E2E testing or a promise of compatibility with every future release.** [Exact scope, historical baselines and known issues](docs/compatibility.md).

If an update breaks the skin, [report your Harness version, installation method and a redacted screenshot/log](https://github.com/d-dev0101/open-sea-skin/issues).

</details>

<details>
<summary><strong>What about performance and privacy?</strong></summary>

The renderer uses adaptive resolution, hidden-tab pause and reduced-motion handling. Animated 3D rendering still uses GPU resources; try the demo on your device first.

The skin does not collect or transmit chat data. Extension permissions are limited to storage and the local Harness hosts. This statement describes Open Sea, not the host application's own behavior. [Privacy & permissions →](docs/privacy.md)

</details>

## 🔒 Permissions and privacy

The skin has no chat-upload or analytics feature. Installed ocean assets and fonts ship locally. The extension reads page markers to recognize Harness and changes its DOM/styles. Visual preferences use browser sync storage and may sync across devices when browser sync is enabled. The archived `site/` demo uses jsDelivr and is not the installed skin or current website. [Full privacy statement](docs/privacy.md)

<a id="development"></a>

## 🛠️ Built for an open ecosystem

The renderer uses **WebGPU, three.js and TSL**, with five Gerstner waves, reflections, foam and sky lighting. The canonical runtime lives in `shared/`; generated plugin, extension and static-loader copies stay synchronized. `site/` preserves the original showcase.

With Node.js 20+:

```sh
npm ci
npm run build
npm run check
npx playwright install chromium
npm run test:browser
npm run test:desktop
npm run test:website
```

| Resource | Purpose |
| --- | --- |
| [Architecture](docs/architecture.md) | Renderer, shared controller and installation adapters |
| [Native source integration](harness-plugin/README.md) | Harness settings/slots integration and pinned compatibility |
| [Release guide](docs/releasing.md) | Packaging and publishing |
| [Changelog](CHANGELOG.md) | Fixes and version history |
| [Contributing through Issues / PRs](https://github.com/d-dev0101/open-sea-skin/issues) | Bug reports, ideas and improvements |
| [DSH plugin topic](https://github.com/topics/dsh-plugin) | Explore the wider community ecosystem |

## 🤝 Community & license

Made for people who want a more personal DeepSeek Harness workspace. Feedback, bug reports and contributions are welcome. Please never post passwords, tokens or private conversations in an Issue.

Project code is [MIT licensed](LICENSE). third-party code and fonts retain their own licenses; see [Third-party notices](THIRD_PARTY_NOTICES.md).

<p align="center"><a href="https://d-dev0101.github.io/open-sea-skin/"><strong>🌊 Find your sea — try the live demo</strong></a></p>
