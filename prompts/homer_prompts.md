# Homer Prompts – QCSv1 One-Time Setup

> Role: You are **Homer (GitHub Copilot)** working inside the `qcsv1` repo.
> Goal: Finish the one-time project bootstrap so Lisa, Cursor, and Smithers can operate via files (no copy/paste routing).

## Active

- Ensure the tree exists (create any missing paths):

```text
qcsv1/
context/
prompts/
outputs/{homer,cursor,smithers}/
logs/
scripts/
.github/workflows/
```

- Add a root `.gitignore` with:

```gitignore
node_modules/
dist/
.env
.DS_Store
```

- Add `.editorconfig`:

```ini
root = true

[*]
end_of_line = lf
insert_final_newline = true
charset = utf-8
indent_style = space
indent_size = 2
```

- Add `.markdownlint.json`:

```json
{ "default": true }
```

1. **Context Files (seed if missing)**

- Create empty (or stubbed) files under `context/`:
  - `project_overview.md`
  - `decisions.md`
  - `constraints.md`
  - `use_cases.md`
  - `workflows.md`
    - `ui_navigation.md`
  - `architecture.md`
  - `schemas.md`
  - `lisa_boot.md`

1. **Prompt Boards (seed)**

- Ensure these files exist with the two sections below:
  - `prompts/homer_prompts.md` (this file)
  - `prompts/cursor_prompts.md`
  - `prompts/smithers_prompts.md`

    Each should contain exactly:

    ```markdown
    # Active
    
    # Completed
    ```
1. **Dev Runner & Ports (Codespaces-friendly)**

- Ensure `dev.sh` at repo root:
  - Enables `corepack`, ensures `pnpm`.
  - Installs workspace deps.
  - Starts **API on port 4000** (use `PORT=4000` env) and Web (Next.js) on 3001.
  - Prints simple hints (“check Ports tab”).
- Add `scripts/dev.api.sh` and `scripts/dev.web.sh` (optional helpers) to start each side independently.

1. **API Health & Smoke (scripts)**

- Create `scripts/smoke_api.sh`:


    ```bash
    #!/usr/bin/env bash
    set -euo pipefail
    P="${API_PORT:-4000}"
    echo "== GET /health ==";      curl -s "http://localhost:${P}/health"      | head -c 400; echo
    echo "== GET /ratecards ==";   curl -s "http://localhost:${P}/ratecards"   | head -c 400; echo
    echo "== POST /quotes/preview =="; curl -s -X POST "http://localhost:${P}/quotes/preview" \
      -H "Content-Type: application/json" \
      -d '{"rateCardId":"rc-launch","scopeInput":{"monthlyOrders":600,"averageOrderValueCents":5000,"averageUnitsPerOrder":2,"shippingSizeMix":[{"size":"S","pct":40},{"size":"M","pct":40},{"size":"L","pct":20}]}}' | head -c 400; echo
    
    ```

- `chmod +x scripts/smoke_api.sh`

1. **README Quick Start (normalize)**

- Ensure README includes:
  - Quick Start using `./dev.sh`
  - API default port **4000** and Web **3001**
  - Minimal curl examples for `/health`, `/ratecards`, `/quotes/preview`
  - Security notes (no secrets in Git)

1. **Logs Backfill (files only, content will come later)**

- Create (if missing):
  - `logs/session_2025-09-20.md`
  - `logs/session_2025-09-21.md`
  - `logs/session_2025-09-26.md`

1. **CI (lightweight)**
- Add `.github/workflows/ci.yml` with:


    ```yaml
    name: ci
    on: [push, pull_request]
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
          - uses: actions/setup-node@v4
            with: { node-version: '20', cache: 'pnpm' }
          - run: corepack enable
          - run: pnpm -v || npm i -g pnpm
          - run: pnpm install
          - run: pnpm -w -r build || echo "build step optional for now"
    ```

1. **Commit & Sync**

- Stage all, commit with a clear message, and push `main`:
## Completed

*Note: If you want, I can also generate the matching `cursor_prompts.md` and `smithers_prompts.md` seed files next, plus the ready-to-paste contents for `context/lisa_boot.md` and the three backfilled log files.*
