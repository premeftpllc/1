#!/usr/bin/env bash
# Regenerate ~/.continue/.env from the SOPS-encrypted shared secrets.
# Works on macOS and Linux. Windows: use sync-secrets.ps1.
#
# Requires: sops, age, and your age PRIVATE key at ~/.config/sops/age/keys.txt
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="$REPO/secrets/premeos.env"
DEST="$HOME/.continue/.env"
export SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"

command -v sops >/dev/null || { echo "sops not installed. macOS: brew install sops age"; exit 1; }
[ -f "$SOPS_AGE_KEY_FILE" ] || { echo "age private key missing at $SOPS_AGE_KEY_FILE"; exit 1; }
[ -f "$SRC" ] || { echo "encrypted secrets not found at $SRC - run: git pull"; exit 1; }

mkdir -p "$(dirname "$DEST")"
umask 077
sops --decrypt "$SRC" > "$DEST"
chmod 600 "$DEST"

echo "wrote $DEST"
echo "variables: $(grep -cE '^[A-Za-z_][A-Za-z0-9_]*=' "$DEST" || true)"
echo "(values not shown by design)"
echo
echo "Next: reload the VS Code window so Continue re-reads it."
