#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$HOME/htdocs/api-beeplay.sy-calculator.com/beeplay/.env"
# shellcheck disable=SC1090
source <(grep -E '^WHATSAPP_' "$ENV_FILE" | sed 's/^/export /' | tr -d '"')

echo "WHATSAPP_API_BASE=$WHATSAPP_API_BASE"
echo "WHATSAPP_SENDER=$WHATSAPP_SENDER"
echo "API_KEY set: $([ -n "${WHATSAPP_API_KEY:-}" ] && echo yes || echo no)"
echo ""

test_send() {
  local label="$1"
  local number="$2"
  local msg="$3"
  echo "=== $label -> $number ==="
  local start=$(date +%s)
  local body
  body=$(printf '{"api_key":"%s","sender":"%s","number":"%s","message":"%s"}' \
    "$WHATSAPP_API_KEY" "$WHATSAPP_SENDER" "$number" "$msg")
  local out
  out=$(curl -s -m 90 -w "\nHTTP:%{http_code}" -X POST "$WHATSAPP_API_BASE/send-message" \
    -H "Content-Type: application/json" -d "$body" || echo "CURL_FAILED")
  local end=$(date +%s)
  echo "$out"
  echo "elapsed: $((end - start))s"
  echo ""
}

test_send "self" "$WHATSAPP_SENDER" "hazjak diagnostic ping"
test_send "seed player" "963599000002" "hazjak diagnostic to player"
