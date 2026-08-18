# DSH plugin installation

The repository root is a self-contained DeepSeek Harness bundle. It adds one
Host row (`open-sea-skin`), one Web client module, and a read-only local asset
route. It does not modify the Harness checkout.

## Install a release

```sh
dsh plugin --profile web add 'github:d-dev0101/open-sea-skin#v1.2.1'
dsh web
```

Open Sea appears behind the Web UI. The **Skin settings** button at the lower
left opens the wave, daylight, glass-opacity, and day-cycle controls. Settings
are saved locally in that browser profile.

## Verify the package

The install should add an `open-sea-skin` row to the selected profile and load
these same-origin URLs with HTTP 200 responses:

```text
/plugins/open-sea-skin/client.js
/open-sea-skin/skin.html
/open-sea-skin/styles.css
/open-sea-skin/ocean.js
```

If the launcher does not appear, confirm the command used the same profile as
`dsh web`, restart the Web process, then perform one normal page reload.

## Update or remove

Install a newer immutable release tag with the same `add` command. To remove
the package and its profile row:

```sh
dsh plugin --profile web remove open-sea-skin
```

Browser appearance values remain local and harmless after removal. Clear the
`ossEnabled`, `ossSea`, `ossTime`, `ossGlass`, and `ossAutoCycle` local-storage
keys only if you also want to reset those preferences.

## Other installation paths

Use the static installer when a packaged Harness frontend cannot use DSH
bundles. Use the source integration only when the complete Open Sea section
must appear inside Harness **Settings → General**. Do not combine installation
paths; the duplicate guard prevents two renderers, but one path is simpler to
update and remove.
