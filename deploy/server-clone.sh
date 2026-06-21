#!/usr/bin/env bash
set -e

PARENT="$HOME/htdocs/api-beeplay.sy-calculator.com"
PROJECT="$PARENT/beeplay"
REPO="https://github.com/AiQotayba/beeplay.git"

# save .env from project or latest rebuild backup
if [ -f "$PROJECT/.env" ]; then
  cp "$PROJECT/.env" /tmp/beeplay-env-backup.env
else
  BACKUP=$(ls -td "$HOME"/beeplay-rebuild-backup-* 2>/dev/null | head -1 || true)
  if [ -n "$BACKUP" ] && [ -f "$BACKUP/.env" ]; then
    cp "$BACKUP/.env" /tmp/beeplay-env-backup.env
  fi
fi

echo "==> Removing $PROJECT"
rm -rf "$PROJECT"

echo "==> Cloning $REPO"
git clone "$REPO" "$PROJECT"

if [ -f /tmp/beeplay-env-backup.env ]; then
  cp /tmp/beeplay-env-backup.env "$PROJECT/.env"
  echo "==> Restored .env"
fi

echo "==> Done"
ls -la "$PROJECT" | head -15
