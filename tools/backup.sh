
#!/usr/bin/env bash
set -euo pipefail
SRC="data"
DST="data/backups/backup-$(date +%F-%H%M%S).zip"
mkdir -p data/backups
zip -r "$DST" "$SRC" -x "data/backups/*"
echo "Backup erstellt: $DST"
