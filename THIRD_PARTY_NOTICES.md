# Third-party notices

Open Sea Skin vendors the following dependencies so the extension and both
Harness installation paths make no runtime network requests.

## three.js 0.178.0

- Project: https://threejs.org/
- Source: https://github.com/mrdoob/three.js/tree/r178
- License: MIT
- Copyright: © 2010–2025 three.js authors
- Local license copy: `shared/vendor/licenses/three-LICENSE.txt`

The vendored WebGPU/TSL build is minified and patched only to use local relative
imports. The optional remote WebGPU debugging import from the upstream build is
intentionally absent.

## Geist fonts

- Project: https://vercel.com/font
- Source: https://github.com/vercel/geist-font
- License: SIL Open Font License 1.1
- Local license copy: `shared/vendor/licenses/geist-OFL.txt`

The `.woff2` files are self-hosted. The font license applies to the font files;
the repository's own source code remains under the MIT License.

## Original showcase CDN dependencies

`site/` is the unchanged original reference implementation and loads three.js
0.178.0 and Geist from jsDelivr. It is kept byte-for-byte for provenance. The
self-contained extension and Harness installers do not use those CDN URLs.
