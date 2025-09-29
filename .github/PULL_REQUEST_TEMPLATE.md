# PR Title
<!-- e.g. feat(api): normalize money to cents at request boundary -->

## Summary
- What changed:
- Why:

## Scope
- [ ] Code change
- [ ] Tests
- [ ] Docs update
- [ ] Chore/infra

## Checklist (process hygiene)
- [ ] Based on latest `main` (`git pull --ff-only` before branch)
- [ ] Small, single-purpose PR (no drive-bys)
- [ ] CI/tests pass locally (or explain)

## Repo bookkeeping (single source of truth)
- [ ] `qcsv1/context/branches.md` updated (In-Flight → In-Review → Closed/Merged)
- [ ] `qcsv1/logs/session_YYYY-MM-DD.md` entry added
- [ ] Blockers added/removed in `prompts/*` (if other AIs depend on this)

> If this PR is **docs-only** (context/, logs/, prompts/), you may push directly to `main` without a PR. **Code changes always use a PR.**

## Verification / Smoke
- [ ] `./dev.sh` runs (ports as expected)
- [ ] curl checks (paste if relevant)

## Links
- Issue/Task:
- Notion (if any):
