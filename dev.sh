#!/usr/bin/env bash
set -euo pipefail

API_PORT="${API_PORT:-4000}"
WEB_PORT="${WEB_PORT:-3001}"

is_listening() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -i -P -n | grep -qE "LISTEN.*:${port}\\b"
  else
    ss -ltnp 2>/dev/null | grep -qE ":${port}\\b"
  fi
}

kill_if_running() {
  pkill -f 'nest start' >/dev/null 2>&1 || true
  pkill -f 'node .*dist/main.js' >/dev/null 2>&1 || true
  pkill -f 'next dev' >/dev/null 2>&1 || true
}

echo "== QCSv1 dev guard =="
echo "API -> :${API_PORT} | WEB -> :${WEB_PORT}"

kill_if_running
sleep 0.5

if is_listening "${API_PORT}"; then
  echo "API already listening on :${API_PORT} — skipping start"
else
  echo "Starting API on :${API_PORT}"
  ( cd apps/api && PORT="${API_PORT}" pnpm start:dev ) > /tmp/api_dev.log 2>&1 &
fi

if is_listening "${WEB_PORT}"; then
  echo "Web already listening on :${WEB_PORT} — skipping start"
else
  echo "Starting Web on :${WEB_PORT}"
  ( cd apps/web && pnpm dev -p "${WEB_PORT}" ) > /tmp/web_dev.log 2>&1 &
fi

sleep 2
echo "--- API tail ---"; tail -n 20 /tmp/api_dev.log 2>/dev/null || echo "no api log yet"
echo "--- WEB tail ---"; tail -n 20 /tmp/web_dev.log 2>/dev/null || echo "no web log yet"

echo "Ready:"; echo "  API  http://localhost:${API_PORT}/health"; echo "  Web  http://localhost:${WEB_PORT}/"
