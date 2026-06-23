#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$HOME/htdocs/api-beeplay.sy-calculator.com/beeplay/.env"
export WHATSAPP_API_KEY=$(grep '^WHATSAPP_API_KEY=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')
export WHATSAPP_SENDER=$(grep '^WHATSAPP_SENDER=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')
export WHATSAPP_API_BASE=$(grep '^WHATSAPP_API_BASE=' "$ENV_FILE" | cut -d= -f2- | tr -d '"')

echo "WHATSAPP_API_BASE=$WHATSAPP_API_BASE"
echo "WHATSAPP_SENDER=$WHATSAPP_SENDER"
echo ""

test_send() {
  local label="$1"
  local number="$2"
  local msg="$3"
  echo "=== $label -> $number ==="
  local start end out body
  start=$(date +%s)
  body=$(printf '{"api_key":"%s","sender":"%s","number":"%s","message":"%s"}' \
    "$WHATSAPP_API_KEY" "$WHATSAPP_SENDER" "$number" "$msg")
  out=$(curl -s -m 90 -w "\nHTTP:%{http_code}" -X POST "$WHATSAPP_API_BASE/send-message" \
    -H "Content-Type: application/json" -d "$body" || echo "CURL_FAILED")
  end=$(date +%s)
  echo "$out"
  echo "elapsed: $((end - start))s"
  echo ""
}

test_send "self" "$WHATSAPP_SENDER" "hazjak diagnostic ping"
test_send "seed player" "963599000002" "hazjak diagnostic to player"
