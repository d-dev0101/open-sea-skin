# Open Sea static Harness installer

This path is for users who run a prebuilt Harness and do not want to compile a
client plugin. The installer copies this directory to the frontend as
`open-sea-skin/` and inserts one marked deferred script before `</head>`.

```sh
bash native-dist/install-skin.sh
bash native-dist/install-skin.sh --update
bash native-dist/install-skin.sh --uninstall
```

Use `--dry-run` to inspect matched installations and `--dist PATH` (or the
`DSH_DIST` environment variable) to select one exact frontend build.

Detection checks npx caches, common global npm packages, a sibling Harness
source build, and the current working directory's `apps/web/dist`. Installation
and update first remove only an existing Open Sea marker, then preserve the
current index as `index.html.oss-backup`. Uninstall removes only the current
marker and `open-sea-skin/`; it intentionally does not restore an old index over
a newer Harness build.

Re-run `--update` after every Harness upgrade because an upgrade can replace the
frontend `index.html` and assets. All settings are stored in the Harness origin's
localStorage (`ossEnabled`, `ossSea`, `ossTime`, `ossGlass`, `ossAutoCycle`).
