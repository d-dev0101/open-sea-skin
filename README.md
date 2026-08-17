# Open Sea Skin

[中文](README.zh.md) · [Architecture](docs/architecture.md) · [Release guide](docs/releasing.md)

A self-contained WebGPU ocean for new tabs and DeepSeek Harness. It keeps the
original five-wave Gerstner/TSL look, adds a translucent Harness theme, and is
available as a Chrome/Edge extension, a one-command static installer, or a
native Harness client plugin.

## Gallery

Every animation below is recorded from the native DeepSeek Harness integration
at **40% glass opacity**. The overview baseline is wave size **56** and daylight
**Afternoon (55)**.

### 1 — Dark Harness overview

![Open Sea inside DeepSeek Harness in dark mode](docs/screenshots/harness-dark-overview-40.gif)

### 2 — Light Harness overview

![Open Sea inside DeepSeek Harness in light mode](docs/screenshots/harness-light-overview-40.gif)

### 3 — Adjusting wave size

Daylight stays at Afternoon (55) while the wave control moves from moderate to
calm, through high sea, and back to the baseline of 56.

![Adjusting wave size in DeepSeek Harness](docs/screenshots/harness-wave-control-40.gif)

### 4 — Daylight to sunset

Wave size stays at 56 while daylight moves smoothly from Midday to Dusk.

![Adjusting daylight from midday to sunset](docs/screenshots/harness-daylight-sunset-40.gif)

## Install option 1 — Chrome or Edge extension

1. Download and unzip the latest `open-sea-skin-extension-*.zip` release, or
   clone this repository.
2. Open `chrome://extensions` (Edge: `edge://extensions`) and enable
   **Developer mode**.
3. Select **Load unpacked** and choose this repository's `extension/` folder.
4. Open a new tab for the full ocean. Open Harness on `127.0.0.1` or
   `localhost` for the glass background skin.

Use the toolbar popup to disable only the Harness skin. The lower-left wave
button opens sea-state, daylight, and glass-opacity controls. Values are saved
with `chrome.storage.sync`.

## Install option 2 — Harness static build (no source compilation)

Clone this repository, then run:

```sh
bash native-dist/install-skin.sh
```

The script finds a built/installed Harness frontend, makes a local backup,
copies the self-contained assets, and injects one marked loader block. If
automatic detection cannot find the frontend, pass it explicitly:

```sh
bash native-dist/install-skin.sh --dist /absolute/path/to/apps/web/dist
```

Re-run `bash native-dist/install-skin.sh --update` **after every Harness
upgrade**. Remove only Open Sea's marker and assets with:

```sh
bash native-dist/install-skin.sh --uninstall
```

See [native-dist/README.md](native-dist/README.md) for detection and recovery
details.

## Native Harness source plugin

For a first-class General-settings row and layout slot, integrate the package
into a Harness source checkout:

```sh
git clone https://github.com/deepseek-ai/deepseek-harness.git
bash harness-plugin/install-into-harness.sh /absolute/path/to/deepseek-harness
cd /absolute/path/to/deepseek-harness
corepack pnpm install
corepack pnpm run build
corepack pnpm dsh web
```

Use the native **Skin settings** action at the lower left for fast adjustments,
or open **Settings → General → Open Sea Skin** for every option. Both surfaces
use Harness settings, locale, slots, and reversible theme-token APIs; neither
depends on CSS-module hashes. The integration is tested against Harness commit
`47f943859bef` (2026-08-13) and deliberately stops if upstream anchors have
changed. More details are in [harness-plugin/README.md](harness-plugin/README.md).

## What is included

- WebGPU + three.js 0.178.0 + TSL, five Gerstner waves, analytic normals, FBM
  detail, Fresnel sky reflection, sun glitter, foam, fog, sky/cloud band,
  bloom, and ACES tone mapping.
- A local-only runtime: three.js and Geist are vendored; the extension and
  installers make no CDN or analytics requests.
- 256×256 mesh (160×160 in low/reduced-motion mode), DPR cap 1.5, adaptive
  render scale 0.5–1.0, 60/30/20 FPS caps, hidden-tab pause, distance-based
  shader work skips, reduced skin bloom, and automatic low-end detection.
- Twelve-minute daylight cycle; manual daylight adjustment pins the selected
  time until automatic cycling is re-enabled.
- Shared host controller for the extension and static installer, with only the
  persistence adapter changing (`chrome.storage` versus `localStorage`).
- Duplicate-render prevention across all installation methods, bilingual UI,
  keyboard focus trapping, Escape close, ARIA labels, and
  `prefers-reduced-motion` support.
- A corrected layout stacking model: Settings stays above the conversation
  composer at wide aspect ratios, while the ocean remains behind every column.

`site/` preserves the original CDN-backed showcase byte-for-byte. The optimized
self-contained runtime has its canonical source in `shared/`; `npm run build`
produces the three installable copies.

## Development and verification

Node.js 20+ is required for repository checks:

```sh
npm run build
npm run check
npm run package:extension
```

The full browser acceptance run requires Chrome for Testing and Playwright:

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

The launcher uses a persistent profile, `--load-extension`, and
`ignoreDefaultArgs: ['--disable-extensions']`, which is required because branded
Chrome 137+ removed the old extension-loading path. The four full-width README
GIFs are regenerated from a running native Harness with `npm run capture`;
FFmpeg is required for palette-optimized output.

## Privacy and permissions

Open Sea Skin collects, transmits, sells, or shares **no data**. The extension
requests only `storage` plus access to `http://127.0.0.1/*` and
`http://localhost/*` so it can skin a local Harness page. It has no remote host
permission. See [docs/privacy.md](docs/privacy.md).

## License

Project code is [MIT licensed](LICENSE). three.js 0.178.0 remains under MIT;
the self-hosted Geist fonts remain under SIL OFL 1.1. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the vendored license copies.
