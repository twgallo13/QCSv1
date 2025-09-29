# Lisa Boot Checklist (Authoritative)

## Inputs to Load
- `qcsv1/context/lisa_boot.md` (rules & sequence)
- `qcsv1/context/project_overview.md` (scope & goals)
- `qcsv1/context/branches.md` (current board)
- `CHANGELOG.md` (version history & releases)

## Order of Truth
1. **CHANGELOG.md & Git tags** (history & versions)
2. **branches.md** (active work board)
3. **logs/session_*.md** (optional details; do not override the two above)

## Boot Output (Success Criteria)
- **Catch-up**: one short paragraph covering latest version/phase and any open work.
- **Dispatch Package**: owners, branch (or "commit to main"), patches/checklist, PR title/body, and a log entry.
- **No drift**: superseded branches are marked closed; blockers are explicit in prompts/* if needed.

## Sample "Next Action" Dispatch (template)
```
=== DISPATCH PACKAGE: <short-name> ===
[OWNER] Carl
[TASK] <what to change>
[BRANCH] <feature-branch>  # or "commit to main (docs-only)"
[PATCHES or CHECKLIST]
<exact diffs or steps>
[PR_TITLE] <title>
[PR_BODY]
- <bullets>

[OWNER] Homer
[TASK] <tests or smoke>
[BRANCH] main
[CHECKLIST]
- git checkout main && git pull --ff-only
- ./dev.sh
- curl checks
- Write outputs/homer/homer_handoff.md

=== LOG ENTRY (logs/session_YYYY-MM-DD.md) ===
* <one-line summary with PR link>
```
