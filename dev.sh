#!/usr/bin/env bash
set -euo pipefail

echo "== QCSv1 Dev Runner =="

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
        pnpm start:dev || pnpm start || pnpm run dev || npx ts-node src/main.ts || node dist/main.js || true
      else
        npm run start:dev || npm start || npx ts-node src/main.ts || node dist/main.js || true
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

echo "== Watching (check Ports tab for forwarded URLs) =="
wait
