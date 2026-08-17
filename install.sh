#!/usr/bin/env bash
# Download a pinned Open Sea source archive and run the static Harness installer.
set -euo pipefail

OPEN_SEA_VERSION="${OPEN_SEA_VERSION:-v1.2.0}"
OPEN_SEA_ARCHIVE_URL="${OPEN_SEA_ARCHIVE_URL:-https://github.com/d-dev0101/open-sea-skin/archive/refs/tags/${OPEN_SEA_VERSION}.tar.gz}"

REQUESTED_MODE="install"
SHOW_RUNTIME_NOTICE=1
for argument in "$@"; do
  case "$argument" in
    --update) REQUESTED_MODE="update" ;;
    --uninstall) REQUESTED_MODE="uninstall" ;;
    --dry-run|-h|--help) SHOW_RUNTIME_NOTICE=0 ;;
  esac
done

if [ "$SHOW_RUNTIME_NOTICE" -eq 1 ]; then
  echo "ℹ Stop Harness before changing its static frontend files."
fi

for required_command in curl tar mktemp; do
  if ! command -v "$required_command" >/dev/null 2>&1; then
    echo "✗ Required command not found: $required_command" >&2
    exit 1
  fi
done

TEMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/open-sea-skin-bootstrap.XXXXXX")"
cleanup() {
  rm -rf -- "$TEMP_ROOT"
}
trap cleanup EXIT INT TERM

ARCHIVE_PATH="$TEMP_ROOT/open-sea-skin.tar.gz"
SOURCE_ROOT="$TEMP_ROOT/source"
mkdir -p "$SOURCE_ROOT"

if [ -n "${OPEN_SEA_ARCHIVE_FILE:-}" ]; then
  cp "$OPEN_SEA_ARCHIVE_FILE" "$ARCHIVE_PATH"
else
  echo "→ Downloading Open Sea Skin ${OPEN_SEA_VERSION}"
  curl --proto '=https' --tlsv1.2 -fsSL "$OPEN_SEA_ARCHIVE_URL" -o "$ARCHIVE_PATH"
fi

tar -xzf "$ARCHIVE_PATH" -C "$SOURCE_ROOT"
INSTALLER="$(find "$SOURCE_ROOT" -type f -path '*/native-dist/install-skin.sh' -print -quit)"
if [ -z "$INSTALLER" ]; then
  echo "✗ The downloaded archive does not contain native-dist/install-skin.sh." >&2
  exit 1
fi

bash "$INSTALLER" "$@"

if [ "$SHOW_RUNTIME_NOTICE" -eq 1 ]; then
  if [ "$REQUESTED_MODE" = "uninstall" ]; then
    echo "ℹ Open Sea is removed. Start Harness again (CLI: dsh web), keep that process running, then reload the browser."
  else
    echo "ℹ Start Harness again (CLI: dsh web), keep that process running, then reload the browser."
  fi
fi
