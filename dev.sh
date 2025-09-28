#!/usr/bin/env bash
set -euo pipefail
echo "== QCSv1 Dev Runner =="
corepack enable >/dev/null 2>&1 || true
pnpm -v || npm i -g pnpm
pnpm -w install
if [ -d "apps/api" ]; then
  echo "[API] starting..."
  (cd apps/api && (pnpm dev || pnpm start)) &
else
  echo "[API] not found"
fi
if [ -d "apps/web" ]; then
  echo "[WEB] starting..."
  (cd apps/web && pnpm dev) &
else
  echo "[WEB] not found"
fi
echo "== Watch Codespaces Ports tab for URLs =="
wait
