# Security policy

## Supported version

Security fixes are applied to the latest tagged release of Open Sea Skin.

## Reporting a vulnerability

Please use the repository's **Security → Report a vulnerability** form so a
report and any proof of concept remain private until a fix is available. If
private vulnerability reporting is unavailable, open a minimal issue that
does not include exploit details and ask the maintainer for a private channel.

Include the affected installation path (DSH plugin, source integration, static
installer, or browser extension), browser and Harness version, reproduction
steps, and expected impact.

## Security model

- The renderer, three.js modules, and fonts are bundled locally; the skin does
  not fetch remote code, analytics, or content.
- Preferences contain only appearance values and stay in `localStorage` or
  `chrome.storage.sync`, depending on the installation path.
- The DSH Host route serves only files inside the packaged `native-dist`
  directory and accepts only `GET` and `HEAD` requests.
- The extension is limited to `storage` and loopback Harness URLs on
  `127.0.0.1` or `localhost`.

These constraints are covered by repository and browser acceptance tests but
do not replace independent review of code before installation.
