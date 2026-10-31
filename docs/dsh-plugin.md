# DSH plugin installation

[中文安装与排错指南](install.zh.md) · [Choose your installation](../README.en.md#install)

The repository root is a self-contained DeepSeek Harness bundle. It adds one
Host row (`open-sea-skin`), one Web client module, and a read-only local asset
route. It does not modify the Harness checkout.

> **Publication status:** GitHub v1.2.7 contains the latest fixes; npm currently offers v1.2.6. npm publication awaits maintainer authentication. Use the [local-package fallback](#local-package-fallback) for the fix release, or the available registry version below.

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
registry in the installer if the requested published version is not available from the mirror.

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
before adding another version. The reviewed `0.2.1-rc.5` Add plugin dialog does not
perform in-place upgrades. If the selected mainland China mirror has not yet
synchronized the published version, choose the **official npm registry** in the same dialog.
The in-app catalog may list an older version; entering the exact package spec
avoids accidentally reinstalling it.

The package-name path avoids a [reported pnpm 11.7.0 bug](https://github.com/deepseek-ai/deepseek-harness/discussions/8294): a cached remote GitHub `.tgz` can fail with
`ERR_PNPM_MISSING_TARBALL_INTEGRITY`. Choosing an npm mirror does not redirect
a GitHub URL. **Do not delete the profile or lockfile** in response to that
error; the installer restores failed profile changes, and deleting the lockfile
does not repair a cached URL resolution. The [official plugin manager
documentation](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.5/packages/client/ui-plugin-manager/README.md) describes the package-name and registry controls.
Native Windows Desktop has not been E2E tested.

On November 1, 2026, the official macOS **0.2.1-rc.5** packaged runtime was used in an isolated profile to install, load and remove the 1.2.7 package. Tests loaded the actual Web client and ocean renderer, then checked both themes and glass controls. macOS/Windows platform attributes were exercised in Chromium; this is **not native Desktop GUI or Windows E2E certification**. See [compatibility evidence and historical tests](compatibility.md).

### Installation sources

The installer offers **two public registries and a custom-registry input**:

1. **Official npm:** `https://registry.npmjs.org`.
2. **Mainland China mirror:** `https://registry.npmmirror.com`. Synchronization can lag.
3. **Custom address:** enter your npm registry URL. For a working public example, enter `https://registry.npmjs.org`; enterprise proxies must serve or proxy the package. A private source may require authentication in the local `.npmrc` (the installer points to `~/.npmrc`). Public-registry installation does not require an npm account.

The package field is always `open-sea-skin@1.2.6` until npm publication of the fixes completes. Registry URLs belong in the separate source field, not the package field. A custom registry is not another public mirror we can publish to on your behalf.

For Harness Web, append `--registry=https://registry.npmjs.org` or `--registry=https://registry.npmmirror.com` to the install command. Use your own registry URL for a custom source. A selected mirror does not redirect remote GitHub downloads. For 404, check the published version; for custom-source 401/403, follow the source's authentication requirements without embedding secrets in URLs or issue reports.

### Local-package fallback

For the v1.2.7 fixes before npm publication, or if registries are unavailable:

1. [Download the v1.2.7 tarball](https://github.com/d-dev0101/open-sea-skin/releases/download/v1.2.7/open-sea-skin-1.2.7.tgz). Keep it as `.tgz`; do not extract it.
2. Uninstall the older Open Sea package in **Plugins**, if installed.
3. Copy the downloaded file's absolute path: **Option–Command–C** in macOS Finder, or **Copy as path** in Windows Explorer.
4. Paste the local path into **Plugins → Add plugin**, removing surrounding quotation marks. Install and enable it.

```text
/Users/your-name/Downloads/open-sea-skin-1.2.7.tgz
C:\Users\your-name\Downloads\open-sea-skin-1.2.7.tgz
```

The official rc.5 [install-spec parser](https://github.com/deepseek-ai/deepseek-harness/blob/dsh-v0.2.1-rc.5/packages/boot/plugin-manager/src/install-spec.ts) accepts absolute `.tgz` paths. This avoids the remote GitHub URL resolution path. Windows support here is source-checked, not a native Windows installation claim. Use the path on your own computer, not either example literally.

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
