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
the `web` profile does not update Desktop. In **Settings → Plugin Market →
Installed**, use v1.2.5 when the catalog offers it, then restart Desktop. The
market's **Themes** tab lists this project under **Themes & Appearance**. If
the catalog still offers 1.2.3, it does **not** include the official 0.2.x
glass fix.

To use v1.2.5 before the catalog synchronizes:

1. Fully quit Desktop, including its background process.
2. [Download `open-sea-skin-1.2.5.tgz`](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.5/open-sea-skin-1.2.5.tgz) to Downloads.
3. Use the `dsh` executable bundled with your Desktop installation, targeting
   `desktop`, not the separately installed npm CLI. Standard macOS app path:

   ```sh
   "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add "$HOME/Downloads/open-sea-skin-1.2.5.tgz"
   ```

4. Reopen Desktop. Confirm the lower-left **Skin settings** button appears.
   Adjust glass to **40%** for the most visible ocean.

The local tarball install and visual result were tested in an **isolated**
official macOS Desktop `0.2.0-rc.2` profile. It fixes the layered background
that made the conversation darker or lighter than the sidebar, while the
composer and Settings remain readable. The official 0.2.x Windows shell is
covered by a browser fixture, but the native Windows app has not been E2E
tested. On Windows or a nonstandard macOS app location, find the bundled CLI
inside the Desktop app rather than guessing an npm `dsh` path. Do not edit or
delete your existing Desktop profile to install the skin.

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
