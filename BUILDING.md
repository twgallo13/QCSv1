# BUILDING — QCSv1

## Prerequisites
- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Firebase CLI (optional, for hosting)
- gcloud (optional, for Cloud Run)

## Quick Start
```bash
./dev.sh
```

## Manual Start
```bash
pnpm -w install
PORT=4000 pnpm --filter ./apps/api dev
pnpm --filter ./apps/web dev
```

## Environment Variables
Create `apps/api/.env` (see `.env.example`):
```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Smoke Tests
```bash
curl http://localhost:4000/health
curl http://localhost:4000/ratecards
```
