#!/usr/bin/env bash
set -euo pipefail

PARENT="$HOME/htdocs/api-beeplay.sy-calculator.com"
PROJECT="$PARENT/beeplay"
BACKUP_DIR="$HOME/beeplay-rebuild-backup-$(date +%Y%m%d-%H%M%S)"
REPO_URL="https://github.com/AiQotayba/beeplay.git"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

mkdir -p "$BACKUP_DIR"
echo "==> Backup to $BACKUP_DIR"

if [ -f "$PROJECT/.env" ]; then
  cp "$PROJECT/.env" "$BACKUP_DIR/.env"
fi

if [ -d "$PROJECT/apps/api/uploads" ]; then
  cp -a "$PROJECT/apps/api/uploads" "$BACKUP_DIR/uploads"
fi

pm2 show beeplay-api > "$BACKUP_DIR/pm2-show.txt" 2>&1 || true
cp "$HOME/.pm2/dump.pm2" "$BACKUP_DIR/dump.pm2" 2>/dev/null || true

echo "==> Stop PM2"
pm2 stop beeplay-api 2>/dev/null || true
pm2 delete beeplay-api 2>/dev/null || true

echo "==> Reset MySQL database"
ENV_FILE="$BACKUP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: no .env backup found"
  exit 1
fi

export DATABASE_URL=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')
DB_USER=$(echo "$DATABASE_URL" | sed -n 's|mysql://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|mysql://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\)$|\1|p')

mysql -u "$DB_USER" -p"$DB_PASS" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "==> Remove old project"
rm -rf "$PROJECT"

echo "==> Clone fresh repo"
git clone "$REPO_URL" "$PROJECT"

echo "==> Restore .env"
cp "$BACKUP_DIR/.env" "$PROJECT/.env"

echo "==> Restore uploads"
mkdir -p "$PROJECT/apps/api/uploads"
if [ -d "$BACKUP_DIR/uploads" ]; then
  cp -a "$BACKUP_DIR/uploads/." "$PROJECT/apps/api/uploads/"
fi

echo "==> Install dependencies"
cd "$PROJECT"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

echo "==> DB push force reset + seed"
cd "$PROJECT/apps/api"
node scripts/with-root-env.mjs db push --force-reset --accept-data-loss
pnpm run generate
pnpm run seed

echo "==> Build API"
pnpm run build

echo "==> Start PM2"
pm2 start /usr/bin/bash --name beeplay-api --cwd "$PROJECT/apps/api" -- -c "node --env-file=../../.env dist/server.js"
pm2 save

echo "==> Health check"
sleep 3
curl -sf "http://127.0.0.1:5000/health" || echo "WARN: health not reachable"

echo "==> DONE. Backup at: $BACKUP_DIR"
pm2 list
