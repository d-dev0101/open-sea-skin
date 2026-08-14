#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('${ROOT}/extension/manifest.json').version")"
OUT="${ROOT}/release/open-sea-skin-extension-v${VERSION}.zip"

mkdir -p "${ROOT}/release"
rm -f "$OUT"
(
  cd "${ROOT}/extension"
  zip -qr "$OUT" . -x '*.DS_Store' 'README.md'
)
echo "$OUT"
