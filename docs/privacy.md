# Privacy statement

Open Sea Skin does not collect, transmit, sell, or share personal information,
usage data, page content, prompts, conversations, or identifiers.

The browser extension uses:

- `storage`: to retain the on/off state and visual preferences.
- `http://127.0.0.1/*` and `http://localhost/*`: to inject the background into a
  locally served DeepSeek Harness interface.

There are no remote host permissions, analytics SDKs, advertising systems,
tracking pixels, or network APIs. three.js and Geist are included locally.
Settings remain in Chrome sync storage for the extension or localStorage for the
static installer; the native plugin uses Harness's own settings service.

The unchanged reference implementation under `site/` is not part of the
extension and uses public jsDelivr URLs to load its documented dependencies.
