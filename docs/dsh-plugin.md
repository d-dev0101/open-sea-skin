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

As checked on October 10, 2026, npm is still at 1.2.3. GitHub v1.2.5
includes the language-sync and official Desktop glass fixes. Do not request
`open-sea-skin@1.2.5` from npm until that version is published. For Harness Web,
use the immutable GitHub tag instead:

```sh
dsh plugin --profile web add 'github:d-dev0101/open-sea-skin#v1.2.5'
```

## DSH Desktop

Official DeepSeek Harness Desktop keeps its own **`desktop` profile**. Updating
the `web` profile does not update Desktop. The easiest path uses Desktop's own
plugin manager—no download folder, terminal, or profile editing:

1. Open **Plugins** in the Desktop sidebar, then choose **Add plugin**.
2. Paste this release package URL into the package/source field:

   ```text
   https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.5/open-sea-skin-1.2.5.tgz
   ```

3. Choose **Install**, review the package details, then **Enable now**.
4. In Harness, use the lower-left **Skin settings** control. Set glass opacity
   to **40%** if you want the ocean to show clearly.

If Open Sea 1.2.3 is already installed, uninstall that package in **Plugins**
before adding this URL. The official `0.2.0-rc.2` Add plugin dialog does not
perform in-place upgrades. The in-app market may still list 1.2.3; it lacks
the official 0.2.x glass fix. Once the market lists 1.2.5, it can be used
instead. A slow or failed GitHub download may succeed on retry.

The URL package was installed using the bundled package manager in an
**isolated** official macOS Desktop `0.2.0-rc.2` profile. The in-app Add plugin
flow and accepted tarball URLs are described in the [official plugin manager
documentation](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.0-rc.2/packages/client/ui-plugin-manager/README.md). We have not
independently completed the in-app UI flow or a native Windows E2E test. The
official 0.2.x Windows shell has browser fixture coverage. Do not edit or
delete your existing Desktop profile to install the skin.

### CLI fallback when Add plugin is unavailable

Fully quit Desktop first. [Download the v1.2.5 tarball](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.5/open-sea-skin-1.2.5.tgz)
to Downloads, then use the `dsh` executable bundled with your Desktop app—not
a separate npm CLI. Standard macOS app path:

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add "$HOME/Downloads/open-sea-skin-1.2.5.tgz"
```

Reopen Desktop afterward. For Windows or a nonstandard macOS app location,
locate the bundled CLI inside the Desktop app rather than guessing a path.
The local tarball fallback and visual result were tested in the isolated macOS
profile; native Windows Desktop has not been E2E tested.

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
