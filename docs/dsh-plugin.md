# DSH plugin installation

[中文安装与排错指南](install.zh.md) · [Choose your installation](../README.en.md#install)

The repository root is a self-contained DeepSeek Harness bundle. It adds one
Host row (`open-sea-skin`), one Web client module, and a read-only local asset
route. It does not modify the Harness checkout.

## Install a release

```sh
dsh plugin --profile web add open-sea-skin@1.2.6
dsh web
```

Open Sea appears behind the Web UI. The **Skin settings** button at the lower
left opens the wave, daylight, glass-opacity, and day-cycle controls. Settings
are saved locally in that browser profile.

Use the explicit version above so a stale registry or mirror cannot silently
select 1.2.3, which lacks the official Desktop glass fix. A mainland China
mirror may take time to synchronize a new npm release; use the official npm
registry in the installer if 1.2.6 is not yet available from the mirror.

## DSH Desktop

Official DeepSeek Harness Desktop keeps its own **`desktop` profile**. Updating
the `web` profile does not update Desktop. The easiest path uses Desktop's own
plugin manager—no download folder, terminal, or profile editing:

1. Open **Plugins** in the Desktop sidebar, then choose **Add plugin**.
2. Enter this exact package name and version:

   ```text
   open-sea-skin@1.2.6
   ```

3. Choose **Install**, review the package details, then **Enable now**.
4. In Harness, use the lower-left **Skin settings** control. Set glass opacity
   to **40%** if you want the ocean to show clearly.

If Open Sea 1.2.3 is already installed, uninstall that package in **Plugins**
before adding 1.2.6. The official `0.2.0-rc.2` Add plugin dialog does not
perform in-place upgrades. If the selected mainland China mirror has not yet
synchronized 1.2.6, choose the **official npm registry** in the same dialog.
The in-app catalog may list an older version; entering the exact package spec
avoids accidentally reinstalling it.

The package-name path avoids a [reported pnpm 11.7.0 bug](https://github.com/deepseek-ai/deepseek-harness/discussions/8294): a cached remote GitHub `.tgz` can fail with
`ERR_PNPM_MISSING_TARBALL_INTEGRITY`. Choosing an npm mirror does not redirect
a GitHub URL. **Do not delete the profile or lockfile** in response to that
error; the installer restores failed profile changes, and deleting the lockfile
does not repair a cached URL resolution. The [official plugin manager
documentation](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.0-rc.2/packages/client/ui-plugin-manager/README.md) describes the package-name and registry controls.
Native Windows Desktop has not been E2E tested.

The previous `open-sea-skin@1.2.5` package was installed successfully from both
the official npm registry and the mainland China mirror with the bundled CLI
in an isolated official macOS Desktop `0.2.0-rc.2` profile. This confirms the
package and registry paths; the in-app UI flow has not been independently
completed. Version 1.2.6 adds overlay/dialog browser regressions; this is not a new native Desktop certification.

### Local-package fallback

If both registries are unavailable, [download the v1.2.6 tarball](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.6/open-sea-skin-1.2.6.tgz)
to Downloads. Fully quit Desktop, then use the `dsh` executable bundled with
your Desktop app—not a separate npm CLI. Standard macOS app path:

```sh
"/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh" plugin --profile desktop add "$HOME/Downloads/open-sea-skin-1.2.6.tgz"
```

Reopen Desktop afterward. This **local file** install was tested in an isolated
official macOS Desktop `0.2.0-rc.2` profile and does not reuse the remote URL's
bad cached integrity entry. For Windows or a nonstandard macOS app location,
locate the bundled CLI inside the Desktop app rather than guessing a path.

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

Install a newer published npm version with the same `add` command. To remove
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
