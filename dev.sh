#!/usr/bin/env bash
set -euo pipefail

echo "== QCSv1 Dev Runner =="

# Allow overriding API port (default 4000) to avoid collision with Next.js (3000)
API_PORT="${API_PORT:-4000}"

corepack enable >/dev/null 2>&1 || true
if ! command -v pnpm >/dev/null 2>&1; then
  echo "Installing pnpm globally (fallback)...";
  npm i -g pnpm >/dev/null 2>&1 || true
fi

# Install workspace dependencies (fallback to npm if pnpm not working)
if command -v pnpm >/dev/null 2>&1; then
  (pnpm -w install || pnpm install) || true
else
  npm install
fi

start_api() {
  if [ -d "apps/api" ]; then
    echo "[API] starting..."
    (
      cd apps/api
      if command -v pnpm >/dev/null 2>&1; then
        PORT="$API_PORT" pnpm start:dev || PORT="$API_PORT" pnpm start || PORT="$API_PORT" pnpm run dev || PORT="$API_PORT" npx ts-node src/main.ts || PORT="$API_PORT" node dist/main.js || true
      else
        PORT="$API_PORT" npm run start:dev || PORT="$API_PORT" npm start || PORT="$API_PORT" npx ts-node src/main.ts || PORT="$API_PORT" node dist/main.js || true
      fi
    ) &
  else
    echo "[API] not found"
  fi
}

start_web() {
  if [ -d "apps/web" ]; then
    echo "[WEB] starting..."
    (
      cd apps/web
      if command -v pnpm >/dev/null 2>&1; then
        pnpm dev || pnpm start || (pnpm build && pnpm start) || npx next dev || true
      else
        npm run dev || npm start || (npm run build && npm start) || npx next dev || true
      fi
    ) &
  else
    echo "[WEB] not found"
  fi
}

start_api
start_web

echo "== Watching (API :$API_PORT, check Ports tab for forwarded URLs) =="
wait
