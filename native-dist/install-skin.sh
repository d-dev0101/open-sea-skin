#!/usr/bin/env bash
# Open Sea Skin static-dist installer for DeepSeek Harness.
set -euo pipefail

SKIN_SRC="$(cd "$(dirname "$0")" && pwd)"
MODE="install"
EXPLICIT_DIST=""
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: bash native-dist/install-skin.sh [options]

Options:
  --update          Refresh an existing installation (same safe operation as install)
  --uninstall       Remove Open Sea assets and only the injected loader block
  --dist PATH       Use one explicit Harness frontend dist directory
  --dry-run         Print the matched dist directories without modifying them
  -h, --help        Show this help

Set DSH_DIST instead of --dist for scripted use. Re-run --update after Harness upgrades.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --update) MODE="update" ;;
    --uninstall) MODE="uninstall" ;;
    --dist)
      shift
      [ "$#" -gt 0 ] || { echo "✗ --dist requires a path" >&2; exit 2; }
      EXPLICIT_DIST="$1"
      ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "✗ Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

[ -n "$EXPLICIT_DIST" ] || EXPLICIT_DIST="${DSH_DIST:-}"

DISTS=()
add_dist() {
  local candidate="$1"
  [ -f "$candidate/index.html" ] || return 0
  local existing
  for existing in "${DISTS[@]:-}"; do [ "$existing" = "$candidate" ] && return 0; done
  DISTS+=("$candidate")
}

if [ -n "$EXPLICIT_DIST" ]; then
  add_dist "$(cd "$EXPLICIT_DIST" 2>/dev/null && pwd || true)"
else
  shopt -s nullglob
  for candidate in \
    "${HOME}/.npm/_npx"/*/node_modules/@deepseek-ai/dsh-web-frontend/dist \
    "${HOME}/.npm/_npx"/*/node_modules/@deepseek-ai/dsh-web/dist \
    "$SKIN_SRC/../../deepseek-harness/apps/web/dist" \
    "$PWD/apps/web/dist"
  do
    add_dist "$candidate"
  done
  if command -v npm >/dev/null 2>&1; then
    GLOBAL_ROOT="$(npm root -g 2>/dev/null || true)"
    if [ -n "$GLOBAL_ROOT" ]; then
      add_dist "$GLOBAL_ROOT/@deepseek-ai/dsh-web-frontend/dist"
      add_dist "$GLOBAL_ROOT/@deepseek-ai/dsh-web/dist"
    fi
  fi
fi

if [ "${#DISTS[@]}" -eq 0 ]; then
  echo "✗ No Harness frontend dist was found." >&2
  echo "  Start Harness once, build apps/web, or pass --dist /absolute/path/to/dist." >&2
  exit 1
fi

strip_loader() {
  python3 - "$1" <<'PYEOF'
from pathlib import Path
import re
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
text = re.sub(
    r'\s*<!-- open-sea-skin:begin -->.*?<!-- open-sea-skin:end -->\s*',
    '\n', text, flags=re.DOTALL,
)
# Upgrade from the original one-tag installer without preserving its stale marker.
text = text.replace('<script type="module" src="/open-sea-skin/loader.js"></script>', '')
text = text.replace('<!-- open-sea-skin:installed -->', '')
path.write_text(text, encoding='utf-8')
PYEOF
}

inject_loader() {
  python3 - "$1" <<'PYEOF'
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
block = '''<!-- open-sea-skin:begin -->
<script src="/open-sea-skin/loader.js" defer></script>
<!-- open-sea-skin:end -->'''
anchor = '</head>'
if anchor not in text:
    raise SystemExit('✗ index.html has no </head> injection anchor')
path.write_text(text.replace(anchor, f'  {block}\n{anchor}', 1), encoding='utf-8')
PYEOF
}

for dist in "${DISTS[@]}"; do
  echo "→ $dist"
  if [ "$DRY_RUN" -eq 1 ]; then continue; fi

  index="$dist/index.html"
  strip_loader "$index"

  if [ "$MODE" = "uninstall" ]; then
    rm -rf -- "$dist/open-sea-skin"
    rm -f -- "$index.oss-backup"
    echo "  Removed the injected loader block and skin assets."
    continue
  fi

  cp "$index" "$index.oss-backup"
  rm -rf -- "$dist/open-sea-skin"
  mkdir -p "$dist/open-sea-skin"
  cp "$SKIN_SRC/loader.js" "$SKIN_SRC/skin.html" "$SKIN_SRC/ocean.js" \
    "$SKIN_SRC/styles.css" "$dist/open-sea-skin/"
  cp -R "$SKIN_SRC/vendor" "$dist/open-sea-skin/vendor"
  inject_loader "$index"
  echo "  Installed assets and loader; backup: $index.oss-backup"
done

if [ "$DRY_RUN" -eq 1 ]; then
  echo "✓ Dry run complete; no files changed."
elif [ "$MODE" = "uninstall" ]; then
  echo "✓ Open Sea Skin was removed. Restart Harness, keep its server running, then reload the browser."
else
  echo "✓ Open Sea Skin is installed. Restart Harness, keep its server running, then reload the browser."
  echo "  Run with --update after Harness upgrades."
fi
