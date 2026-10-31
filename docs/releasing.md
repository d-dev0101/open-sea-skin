# Release guide

## 1. Prepare

1. Update the version in `package.json` and `extension/manifest.json`.
2. Run `npm ci` and `npm run build`.
3. Confirm `npm run check` reports that every generated install copy matches
   `shared/`.

## 2. Verify

Run the repository gates:

```sh
npm run check
npm run test:browser
npm run test:desktop
npm run package:extension
```

For native verification, integrate into the pinned Harness checkout, run its
Host and Client builds, start `pnpm dsh web`, and then run:

```sh
npm run capture
```

The capture job tests the sidebar launcher, live controls, persistence after
reload, and the wide-window Settings stacking regression before regenerating
the committed PNG/GIF gallery. Visually review every file in
`docs/screenshots/`.

## 3. Pack once and publish GitHub artifacts

After all checks pass, commit the source and generated runtime, then prepare the
release once. Do not regenerate the archive between GitHub and npm:

```sh
mkdir -p release-audit
npm pack --ignore-scripts --pack-destination release-audit --json > release-audit/pack.json
node -e 'const fs=require("fs"); const p=require("./release-audit/pack.json")[0]; fs.copyFileSync("release-audit/"+p.filename,"release-audit/open-sea-skin.tgz")'
(cd release-audit && shasum -a 256 open-sea-skin-*.tgz open-sea-skin.tgz > SHA256SUMS)
```

Tag the checked commit `vX.Y.Z`. Attach the versioned tarball, byte-identical
`open-sea-skin.tgz`, `SHA256SUMS`, and the extension ZIP to its GitHub Release.
The version-free tarball is required by the marketplace. Check the final assets
before publishing, and keep the checksums alongside them.

If npm authentication is deferred, the release notes, README and website must
say **GitHub version X.Y.Z; npm version A.B.C**. Copy buttons must still refer to
the actually available npm version. Offer a downloaded local tarball as the
fix-release fallback; never describe a pending npm version as available.

## 4. Publish those same bytes to npm

The root package is the prebuilt Desktop/Web bundle. The manual-only workflow
`.github/workflows/npm-publish.yml` downloads the **existing** versioned GitHub
asset and `SHA256SUMS`, verifies SHA-256 and the embedded package name/version,
then publishes it. It neither builds nor repacks nor overwrites release assets.

Configure the existing `NPM_TOKEN` secret with appropriate package publishing
permissions, then dispatch the workflow with the release tag. A 404 for the
exact npm version permits publishing. Authentication, network or service errors
stop the job. If that npm version already exists, the workflow skips publishing
and verifies that it is byte-identical. This makes recovery after a partially
successful release safe; an inconsistent registry tarball fails the job.

For a manual publish after browser login, download the release assets, extract
`package/package.json` to a temporary metadata file and verify them first:

```sh
npm login --registry=https://registry.npmjs.org
node scripts/verify-release.mjs --github release-audit/open-sea-skin-X.Y.Z.tgz release-audit/SHA256SUMS release-audit/package.json vX.Y.Z
node scripts/verify-release.mjs --registry release-audit/open-sea-skin-X.Y.Z.tgz vX.Y.Z release-audit --allow-missing
# Run publish only when the previous command explicitly reports missing.
npm publish ./release-audit/open-sea-skin-X.Y.Z.tgz --ignore-scripts --access public --registry=https://registry.npmjs.org
node scripts/verify-release.mjs --registry release-audit/open-sea-skin-X.Y.Z.tgz vX.Y.Z release-audit
```

After npm verification, update copyable install targets and publication notices
in the README, website and install guides. Preserve the already published
archives. Check the mainland mirror separately; synchronization can lag. Retain
the workflow integrity evidence. Never delete a user's profile or lockfile to
work around remote GitHub tarball installation failures.

## 5. Optional Chrome Web Store submission

Upload the same extension ZIP through a Chrome Web Store developer account.
The listing privacy answers are: no data collection or sale; no remote code;
`storage` saves preferences; loopback host access skins a locally running
Harness. Keep [privacy.md](privacy.md) linked from the listing and retain the
three.js MIT and Geist OFL notices in the package.
