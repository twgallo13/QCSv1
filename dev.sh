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
    # Ensure desired port is free before starting (prevents nested fallback spawning prod instance)
    if lsof -ti tcp:"$API_PORT" >/dev/null 2>&1; then
      echo "[API] freeing port $API_PORT (killing PIDs $(lsof -ti tcp:"$API_PORT" | tr '\n' ' '))"
      lsof -ti tcp:"$API_PORT" | xargs -r kill -9 || true
      # tiny delay to allow socket release
      sleep 0.3
    fi
    (
      cd apps/api
      if command -v pnpm >/dev/null 2>&1; then
        # Prefer watch mode; only fall back to plain start if script missing; avoid cascading into prod binary unless both fail for non-port reasons
        if PORT="$API_PORT" pnpm start:dev; then
          true
        elif PORT="$API_PORT" pnpm start; then
          true
        else
          echo "[API] watch/start scripts failed; attempting ts-node fallback"
          PORT="$API_PORT" npx ts-node src/main.ts || (echo "[API] final fallback to built dist" && PORT="$API_PORT" node dist/main.js || true)
        fi
      else
        if PORT="$API_PORT" npm run start:dev; then
          true
        elif PORT="$API_PORT" npm start; then
          true
        else
          echo "[API] watch/start scripts failed; attempting ts-node fallback"
          PORT="$API_PORT" npx ts-node src/main.ts || (echo "[API] final fallback to built dist" && PORT="$API_PORT" node dist/main.js || true)
        fi
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
