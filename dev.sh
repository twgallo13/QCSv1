#!/usr/bin/env bash
# QCSv1 guarded dev runner
# Usage:
#   ./dev.sh               # start if not already running (idempotent)
#   ./dev.sh --follow      # start (if needed) and tail logs
set -euo pipefail

API_PORT="${API_PORT:-4000}"
WEB_PORT="${WEB_PORT:-3001}"
FOLLOW=0
if [[ "${1:-}" == "--follow" ]]; then FOLLOW=1; fi

is_listening() {
  # returns 0 if something is listening on $1
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -i -P -n | grep -qE "LISTEN.*:${port}\\b"
  else
    ss -ltnp 2>/dev/null | grep -qE ":${port}\\b"
  fi
}

kill_if_running() {
  # best-effort process cleanup by common patterns
  pkill -f 'nest start' >/dev/null 2>&1 || true
  pkill -f 'node .*dist/main.js' >/dev/null 2>&1 || true
  pkill -f 'next dev' >/dev/null 2>&1 || true
}

wait_for_port() {
  local port="$1"
  local tries="${2:-20}"  # ~10s if sleep 0.5
  local i=0
  while (( i < tries )); do
    if is_listening "$port"; then return 0; fi
    sleep 0.5; ((i++))
  done
  return 1
}

echo "== QCSv1 dev guard =="
echo "API -> :${API_PORT} | WEB -> :${WEB_PORT}"

# One-time cleanup
kill_if_running
sleep 0.5

# Start API if needed
if is_listening "${API_PORT}"; then
  echo "API already listening on :${API_PORT} — skipping start"
else
  echo "Starting API on :${API_PORT}"
  ( cd apps/api && PORT="${API_PORT}" pnpm start:dev ) > /tmp/api_dev.log 2>&1 &
fi

# Start WEB if needed
if is_listening "${WEB_PORT}"; then
  echo "Web already listening on :${WEB_PORT} — skipping start"
else
  echo "Starting Web on :${WEB_PORT}"
  ( cd apps/web && pnpm dev -p "${WEB_PORT}" ) > /tmp/web_dev.log 2>&1 &
fi

# Probe ports with retry so logs reflect real readiness
if ! wait_for_port "${API_PORT}" 20; then echo "WARN: API not listening on :${API_PORT} (yet)"; fi
if ! wait_for_port "${WEB_PORT}" 20; then echo "WARN: Web not listening on :${WEB_PORT} (yet)"; fi

echo "--- API tail ---"
tail -n 20 /tmp/api_dev.log 2>/dev/null || echo "no api log yet"
echo "--- WEB tail ---"
tail -n 20 /tmp/web_dev.log 2>/dev/null || echo "no web log yet"

echo "Ready:"
echo "  API  http://localhost:${API_PORT}/health"
echo "  Web  http://localhost:${WEB_PORT}/"

if (( FOLLOW == 1 )); then
  echo
  echo "== Following logs (Ctrl+C to stop) =="
  tail -n 0 -f /tmp/api_dev.log /tmp/web_dev.log
fi
