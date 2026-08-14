# Architecture

Open Sea Skin has one renderer and three delivery paths. `shared/` is the
canonical implementation; `npm run build` copies it into the extension,
static installer, and native Harness package. `site/` is the original
CDN-backed showcase and is intentionally preserved byte-for-byte.

## Runtime layout

| Layer | Responsibility |
| --- | --- |
| `shared/ocean.js` | WebGPU renderer, TSL materials, adaptive quality and secure parent messaging |
| `shared/skin-core.js` | Static/extension iframe lifecycle, glass tokens, quick controls and accessibility |
| `shared/extension-entry.js` | `chrome.storage.sync` adapter and extension asset URLs |
| `shared/native-entry.js` | `localStorage` adapter and relative asset URLs |
| `harness-plugin/` | Native Cordis Host/Client package, slots, settings scope and reversible theme tokens |

The extension and static paths concatenate `skin-core.js` with one persistence
adapter at build time. Their generated `content.js` and `loader.js` therefore
cannot drift. Every path claims the same `#__open-sea-skin__` id before
starting WebGPU, preventing duplicate renderers when two installation methods
are enabled together.

## Native Harness integration

Harness client plugins are compiled into the Web bundle; there is no runtime
UI-plugin installation API. `harness-plugin/install-into-harness.sh` therefore
copies the package into a source checkout and applies small, idempotent source
integrations:

- adds a frame-owned `shell.background` slot behind all three columns;
- registers the client package in TypeScript, the Web bundle and Cordis graph;
- explicitly exposes the `ui-open-sea-skin` settings namespace through the
  loopback Web settings allowlist;
- isolates the layout frame's stacking context and places the background at
  `z-index: -1`, without creating per-column stacking contexts.

The last rule is important. Assigning `z-index` to the sidebar, conversation,
and details columns traps the Settings modal inside the sidebar context and
allows the conversation composer to paint over it. The installer migrates the
earlier faulty rule, and the gallery run reproduces the geometric intersection
at 2048×1024 before asserting that the Settings dialog owns the topmost hit.

The native package contributes:

- `shell.background`: same-origin ocean iframe;
- `sidebar.footer.action`: always-available “Skin settings” launcher;
- `settings.general.item`: full settings row;
- `ctx.theme.overrideTokens()`: reversible glass palette;
- Host settings schema and traversal-safe `/open-sea-skin` asset route.

The background waits for the settings scope to reach `ready` before its first
render. That prevents a flash of defaults and ensures persisted sea, daylight,
glass, cycle and quality values are used on the first frame.

## Renderer and quality policy

The visual model keeps the original five Gerstner waves, analytic normal,
FBM detail, Fresnel sky reflection, sun glitter, crest foam, horizon fog,
cloud band, bloom and ACES tone mapping. Production changes reduce cost without
changing those formulas:

- 256×256 mesh; 160×160 for low-power or reduced-motion operation;
- device pixel ratio capped at 1.5 and adaptive render scale from 0.5–1.0;
- frame caps selected from motion preference and detected device capacity;
- hidden-tab pause and no MSAA;
- expensive detail, glitter and foam skipped beyond 140 world units;
- skin mode uses lower bloom and a low-power adapter preference;
- shader noise coordinates are reduced modulo 289 to avoid distant precision
  degradation.

With `prefers-reduced-motion`, the renderer uses its low mesh, runs near 20 FPS,
and substantially slows time rather than removing the scene abruptly.

## Glass and stacking

Glass is applied through Harness semantic tokens, not nested opacity:
`--dsw-alias-bg-base`, `layer-1..3`, `module-platform`, `multi-select`,
`overlay`, `--dsw-specific-sidebar-fill`, and `selector`. Light mode defaults
near 0.72; dark mode derives roughly 0.12 lower. Elevated overlays receive a
higher alpha to preserve legibility. The native plugin uses the theme API;
static compatibility retains a small set of documented CSS-module fallbacks.

## Security and privacy

All three.js modules and Geist fonts are local. The renderer accepts settings
messages only from `window.parent` and the expected parent origin. The native
asset route blocks traversal, serves GET/HEAD only, and disables stale caching.
The extension has only `storage` plus the two loopback host permissions. There
is no analytics, telemetry, CDN, account, or data upload.

## Compatibility

The native integration is verified against DeepSeek Harness commit
`47f943859bef` (2026-08-13). If an upstream anchor changes, the installer exits
instead of guessing. The extension and static installer remain independent of
that source layout.
