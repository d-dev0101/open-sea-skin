#!/usr/bin/env bash
# Copy this package into a DeepSeek Harness checkout and add its four assembly registrations.
set -euo pipefail

PLUGIN_ROOT="$(cd "$(dirname "$0")" && pwd)"
HARNESS_ROOT="${1:-}"

if [ -z "$HARNESS_ROOT" ] || [ ! -f "$HARNESS_ROOT/AGENTS.md" ] || [ ! -d "$HARNESS_ROOT/packages/client/ui-layout" ]; then
  echo "Usage: bash harness-plugin/install-into-harness.sh /absolute/path/to/deepseek-harness" >&2
  exit 2
fi

HARNESS_ROOT="$(cd "$HARNESS_ROOT" && pwd)"
TARGET="$HARNESS_ROOT/packages/client/ui-open-sea-skin"

if [ -e "$TARGET" ]; then
  if [ ! -f "$TARGET/package.json" ] || ! grep -qF 'dsh-client-ui-open-sea-skin' "$TARGET/package.json"; then
    echo "✗ Refusing to replace unexpected directory: $TARGET" >&2
    exit 1
  fi
  rm -rf -- "$TARGET"
fi

mkdir -p "$TARGET"
cp -R "$PLUGIN_ROOT/assets" "$PLUGIN_ROOT/src" "$TARGET/"
cp "$PLUGIN_ROOT/package.json" "$PLUGIN_ROOT/tsconfig.json" "$PLUGIN_ROOT/tsdown.config.ts" \
  "$PLUGIN_ROOT/README.md" "$PLUGIN_ROOT/README.zh.md" "$TARGET/"

node "$PLUGIN_ROOT/integration/update-harness.mjs" "$HARNESS_ROOT"

echo "✓ Native package copied to $TARGET"
echo "  Next: cd '$HARNESS_ROOT' && corepack pnpm install && corepack pnpm --filter @deepseek-ai/dsh-client-ui-open-sea-skin bundle"
echo "  Run Harness from source afterward; Open Sea Skin will appear in General settings."
