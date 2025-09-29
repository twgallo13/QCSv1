# Contributing to QCSv1

Thanks for helping! This doc defines the **small/safe** process used in this repo.

## Pull Requests
- Use the template at `.github/PULL_REQUEST_TEMPLATE.md`.
- Keep PRs **small & single-purpose**; docs-only changes can go straight to `main` (see below).
- Title format: `type(scope): summary`, e.g., `docs(readme): clarify setup`.

## Branching
- Feature/fix branches: `feat/<slug>` or `fix/<slug>`.
- Update `context/branches.md` when opening/merging PRs.

## Docs-only Fast Lane
- For **documentation-only** updates, commit directly to `main` with clear messages.
- Always add a line to `qcsv1/logs/session_YYYY-MM-DD.md` for traceability.

## Dev Quickstart
- API defaults to **:4000** locally.
- `./dev.sh` to run services; see `CHANGELOG.md` for recent port changes.

## Style & Hygiene
- Prefer consistent integer-cents handling at boundaries (see Phase 3 notes).
- Tests for logic changes; docs updated for behavior/ports/process.
