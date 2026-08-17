# Screenshot set

Committed README media:

- `harness-dark-overview-40.gif` — native Harness dark-mode overview.
- `harness-light-overview-40.gif` — native Harness light-mode overview.
- `harness-wave-control-40.gif` — wave-size control from calm to high sea.
- `harness-daylight-sunset-40.gif` — daylight control from midday to dusk.

Regenerate the complete set with `npm run capture`. Capture uses Chrome for
Testing, a 1440×900 Harness viewport, local assets, and deterministic settings.
All four GIFs use 40% glass opacity and are palette-optimized to 1160px with
FFmpeg. Review every animation visually before publishing; WebGPU rendering
may vary slightly between hardware and SwiftShader.
