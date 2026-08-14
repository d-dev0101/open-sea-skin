# @deepseek-ai/dsh-client-ui-open-sea-skin

English | [中文](README.zh.md)

Native DeepSeek Harness plugin for the Open Sea realtime WebGPU background. The Host half registers the `ui-open-sea-skin` settings schema and serves self-contained renderer assets at `/open-sea-skin`; the Client half contributes the background through `shell.background`, adds a lower-left quick-control action and a General-settings row, and layers glass values through `ctx.theme.overrideTokens()`.

## Integrate into a Harness checkout

From the Open Sea Skin repository:

```sh
bash harness-plugin/install-into-harness.sh /absolute/path/to/deepseek-harness
cd /absolute/path/to/deepseek-harness
corepack pnpm install
corepack pnpm --filter @deepseek-ai/dsh-client-ui-open-sea-skin bundle
corepack pnpm run build
corepack pnpm dsh web
```

The installer copies this package to `packages/client/ui-open-sea-skin` and idempotently adds the required client aggregate reference, Web bundle dependency, Cordis row, settings exposure and layout-owned `shell.background` slot. It also migrates the earlier per-column stacking rule that could place the conversation composer above Settings. It targets the Harness client architecture at commit `47f943859bef` (2026-08-13); if those integration anchors change upstream, it stops without guessing.

Use the lower-left **Skin settings** action for sea, daylight and glass controls, or open **Settings → General → Open Sea Skin** for every option. Manual daylight input disables the cycle until the cycle checkbox is re-enabled.

## Architecture

- `src/index.ts`: Host settings registration plus a traversal-safe static resource route.
- `src/client/index.ts`: Client plugin assembly, durable settings adoption and reversible theme-token layer.
- `src/client/OpenSeaBackground.tsx`: same-origin background iframe registered through the layout slot.
- `src/client/OpenSeaSettingsRow.tsx`: bilingual, keyboard-accessible General settings contribution.
- `src/client/OpenSeaQuickControls.tsx`: native sidebar action and compact dialog.
- `assets/`: generated copy of the canonical renderer under the repository's `shared/` directory.

The extension and static-dist installers use the same DOM ids (`#__open-sea-skin__`, `#__open-sea-skin-btn__`). The native component checks the shared iframe id before mounting, so enabling more than one installation path never starts a second renderer.

## Model Experience

None. This plugin changes browser presentation and user settings only; it does not add model-visible context, tools, messages or provider requests.

#### KV Cache effect

None; the plugin never assembles or modifies a model request.

## Known Limitations and Deferred Work

- The native package needs one additive `shell.background` slot in `ui-layout`; that integration is automated but remains an upstream source change until Harness ships a background slot itself.
- Renderer quality changes reload the isolated ocean frame because mesh density and adapter preference are boot-time decisions.
- The native package currently targets the Web client. Electron/file-protocol asset carriage needs a separate resource provider.
