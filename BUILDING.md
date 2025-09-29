# BUILDING — QCSv1

This guide explains how to install, run, and test QCSv1 locally or in Codespaces.

## Prerequisites
- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- Firebase CLI (optional, for Hosting)
- gcloud (optional, for Cloud Run)

## Ports
- Web (Next.js): **3000** (Codespaces may re-map to 3001+)
- API: **4000**

## Quick Start
Run the provided script:
```bash
./dev.sh
This will:

Enable corepack and ensure pnpm

Install workspace dependencies

Start the API on :4000

Start the Web app on :3000

Print Codespaces port forwarding hints

Manual Start
From the repo root:

bash
Copy code
# install deps
pnpm -w install

# start API (on port 4000)
PORT=4000 pnpm --filter ./apps/api dev

# start Web (Next.js, on port 3000)
pnpm --filter ./apps/web dev
Environment Variables (API)
Create a file at apps/api/.env (or copy .env.example):

env
Copy code
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...escaped...\n-----END PRIVATE KEY-----\n"
Smoke Tests
Use curl to check endpoints:

bash
Copy code
# API health
curl http://localhost:4000/health

# Rate cards
curl http://localhost:4000/ratecards

# Preview example
curl -X POST http://localhost:4000/quotes/preview \
  -H "Content-Type: application/json" \
  -d '{"rateCardId":"rc-launch","scopeInput":{"monthlyOrders":600,"averageOrderValueCents":5000,"averageUnitsPerOrder":2,"shippingSizeMix":[{"size":"S","pct":40},{"size":"M","pct":40},{"size":"L","pct":20}]}}'
Scripts
bash
Copy code
# Run smoke test script
scripts/smoke_api.sh
CI
A GitHub Actions workflow exists at .github/workflows/ci.yml for basic build checks.

Troubleshooting
Port conflict: Web uses 3000, API uses 4000. Codespaces may re-map Web to 3001+.

pnpm not found: Run corepack enable && npm i -g pnpm.

Secrets: Never commit private keys. Use .env locally or provider secrets in deployment.

Firebase Admin key: Must be properly escaped in .env (newlines as \n).

Deployment (Outline)
Web → Firebase Hosting

API → Google Cloud Run (build Docker image, push to Artifact Registry, deploy)