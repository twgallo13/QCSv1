# AI REFERENCE — QCSv1

## Roles
- Lisa — prompt engineer/dispatcher
- Homer — coder (GitHub Copilot)
- Cursor — designer/dev-helper
- Smithers — Notion AI (scribe)
- Matt — advisor

## Directory Map
qcsv1/
  context/   # project memory
  prompts/   # task lists for each AI
  outputs/   # results
  logs/      # daily recaps

## Startup Routine
1. Load `context/lisa_boot.md`
2. Load `context/project_overview.md`
3. Check most recent log in `/logs/`

## Prompt File Format
```
# Active
- task 1
- task 2

# Completed
- [DONE] task → outputs/<role>/<file>
```

## Logging
At session end, Lisa writes:
- Done
- In progress
- Next
- Open questions
