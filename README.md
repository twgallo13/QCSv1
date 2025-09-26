# QCSv1 — Quote Calculator System

Internal tool for building, previewing, and persisting client quotes using Firebase + a lightweight Node API.

- **Live App:** [https://qcsv1-a4dc8.web.app](https://qcsv1-a4dc8.web.app)
- **Repository:** [https://github.com/twgallo13/QCSv1](https://github.com/twgallo13/QCSv1)

---

## Features

- Admin sign-in (Firebase Auth)
- Create & preview quotes from configurable rate cards (Firestore)
- Save quotes and later compare against newer rate card versions
- Asset/logo storage (Firebase Storage)
- Hosting: Web (Firebase Hosting) + API (Cloud Run)

---

## Tech Stack

- **Frontend:** Next.js / React (`apps/web`)
- **Backend:** Node / (Nest placeholder currently) (`apps/api`)
- **Infra:** Firebase (Auth, Firestore, Storage, Hosting), Cloud Run (API)
- **Dev Tooling:** pnpm (corepack), GitHub Codespaces

---

## Monorepo Layout

```text
apps/
  web/    # Next.js frontend
  api/    # API service (Nest scaffold -> quote logic)
dev.sh    # Convenience launcher (starts both)
packages/ # (future shared libs: calc-engine, schema, ui)
```

---

## Quick Start (Codespaces)

Simplest:

```bash
./dev.sh
```

The script will:

1. Enable corepack & ensure pnpm
2. Install workspace dependencies (`pnpm -w install`)
3. Start API (default :4000)
4. Start Web (Next.js, default :3000)

Manual alternative:

```bash
pnpm install
pnpm --filter apps/api start:dev
pnpm --filter apps/web dev
```

Once running, open the forwarded web port → `/quote`.

---

## Environment Variables (Backend)

Create `apps/api/.env`:

```env
FIREBASE_PROJECT_ID=qcsv1-a4dc8
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@qcsv1-a4dc8.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...escaped...\n-----END PRIVATE KEY-----\n"
```

Add `apps/api/.env.example` with placeholder values (no secrets).

---

## Firebase Frontend Config

```bash
# API default port changed to 4000 to avoid clashing with Next.js dev server
curl -s http://localhost:4000/health
curl -s http://localhost:4000/ratecards
SAVE=$(curl -s -X POST http://localhost:4000/quotes \
  -H 'Content-Type: application/json' \
  -d '{"rateCardId":"rc-launch","scopeInput":{"monthlyOrders":500,"averageOrderValueCents":6500,"averageUnitsPerOrder":2}}')
ID=$(echo "$SAVE" | sed -n 's/.*"id":"\([^" ]*\)".*/\1/p')
curl -s "http://localhost:4000/quotes/$ID/preview-newer"
```

---

## Core API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness check |
| GET | /ratecards | List available rate cards |
| POST | /quotes/preview | Compute a transient (not saved) quote |
| POST | /quotes | Persist a quote and return its id |
| GET | /quotes/:id | Retrieve saved quote |
| GET | /quotes/:id/preview-newer | Compare saved quote vs latest rate card |

---

## Preview-Newer Flow

1. User saves a quote (locks in rate card version).
2. Rate card later changes in Firestore.
3. Visiting `/quotes/:id` triggers UI banner if newer version exists.
4. User clicks “Preview with Newer Rates” → calls `/quotes/:id/preview-newer`.
5. UI displays Saved vs Newer vs Diff.

---

## Dev Script (`dev.sh`)

Fallback logic attempts multiple start commands so minimal config is needed early on.

---

## Local Smoke Tests

After starting services:

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/ratecards
SAVE=$(curl -s -X POST http://localhost:3000/quotes \
  -H 'Content-Type: application/json' \
  -d '{"rateCardId":"rc-launch","scopeInput":{"monthlyOrders":500,"averageOrderValueCents":6500,"averageUnitsPerOrder":2}}')
ID=$(echo "$SAVE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
curl -s "http://localhost:3000/quotes/$ID/preview-newer"
```

---

## Deployment (Outline)

### Web (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

### API (Cloud Run)

1. docker build -t REGION-docker.pkg.dev/PROJECT/REPO/qcsv1-api:TAG .
2. docker push REGION-docker.pkg.dev/PROJECT/REPO/qcsv1-api:TAG
3. gcloud run deploy qcsv1-api --image REGION-docker.pkg.dev/PROJECT/REPO/qcsv1-api:TAG --region=REGION --set-env-vars ...
4. (Optional) Add GitHub Action for CI/CD.

---

## Security Notes

- Never commit raw service account private keys.
- Restrict Firestore rules to authenticated single admin (current scope).
- Use principle of least privilege for any CI/CD service accounts.

---

## Roadmap

- e2e tests (Playwright/Cypress)
- Automated API deploy pipeline
- Role-based access (future multi-user)
- Quote PDF export
- Rate card version history UI

---

## License

TBD (add MIT/Apache-2.0 or All Rights Reserved).

---

_Last updated: Port separation (API now :4000)._
