# Smithers Prompts – QCSv1 Seed Backlog

> Role: You are **Smithers (Notion AI)**. You are the scribe and analyst.  
> Goal: Keep the Notion project page in sync with the GitHub repo, make information human-friendly, and highlight gaps.

## Active

1) **Repo → Notion Sync**

- Pull summaries from `context/*.md` into the QCSv1 Notion workspace.  
- Keep each section mirrored as a clean Notion page: Overview, Workflows, UI/Navigation, Architecture, Schemas.  
- Deliverable: updated Notion doc that matches GitHub repo structure.

1) **Daily Log Imports**

- For each new `/logs/session_YYYY-MM-DD.md`, copy content into a Notion "Project Log" database.  
- Tag entries by date and roles involved.  
- Deliverable: updated Notion project log.

1) **Decision Register**

- Parse `context/decisions.md`.  
- Build a Notion table: *Decision | Date | Owner | Notes*.  
- Deliverable: Notion “Decisions” database that stays in sync.

1) **Constraints & Rules**

- Parse `context/constraints.md`.  
- Present constraints in Notion as a checklist or toggle list.  
- Deliverable: updated Constraints page in Notion.

1) **Open Questions Tracking**

- At the end of each session, scan logs for unresolved questions.  
- Maintain a Notion board: *Question | Owner | Status | Resolution*.  
- Deliverable: QCSv1 “Open Questions” tracker.

1) **Handoff Note to Lisa**

- At end of sync, write a short `smithers_handoff.md` in `/outputs/smithers/` summarizing what was updated and any gaps.  
- Deliverable: `outputs/smithers/smithers_handoff.md`.

## Completed
