# DSH plugin installation

The repository root is a self-contained DeepSeek Harness bundle. It adds one
Host row (`open-sea-skin`), one Web client module, and a read-only local asset
route. It does not modify the Harness checkout.

## Install a release

```sh
dsh plugin --profile web add open-sea-skin@1.2.3
dsh web
```

Open Sea appears behind the Web UI. The **Skin settings** button at the lower
left opens the wave, daylight, glass-opacity, and day-cycle controls. Settings
are saved locally in that browser profile.

## DSH Desktop

In **Settings → Plugin Market → Installed**, update `open-sea-skin` to
`1.2.3` or newer and restart Harness using the desktop Settings menu. The
market's **Themes** tab lists this project under **Themes & Appearance**.
If the catalog still reports `1.2.2` as current, wait for its registry refresh
or use the `open-sea-skin@1.2.3` npm package through the market's package installer.

Version `1.2.3` fixes uneven glass in Desktop's advanced and extended shells:
all three columns share one translucent background while composers and dialogs
retain their own fills. The browser regression fixture is based on Desktop
Beta `2.0.5-beta.1` shell styles; it is not a full native desktop end-to-end test.

## Verify the package

### Git install fails at `git ls-remote`

Use the npm command above instead of the Git URL. The npm release already
contains its built assets and does not need a `prepare` build. A failure at
`git ls-remote` happens before a build starts; the generic `allowBuilds` hint
does not establish that build permissions caused it. If npm also fails, share
the complete error output (redact credentials and private paths). Do not
enable arbitrary dependency build scripts or delete your Harness profile.


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
