#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

PROJECT="$HOME/htdocs/api-beeplay.sy-calculator.com/beeplay/apps/api"
cd "$PROJECT"

echo "==> Generate Prisma client"
pnpm run generate

echo "==> Seed database"
pnpm run seed

echo "==> Build API"
pnpm run build

echo "==> Start PM2"
pm2 delete beeplay-api 2>/dev/null || true
pm2 start /usr/bin/bash --name beeplay-api --cwd "$PROJECT" -- -c "node --env-file=../../.env dist/server.js"
pm2 save

echo "==> Health"
sleep 2
curl -sf "http://127.0.0.1:5000/health"
echo ""
pm2 list
