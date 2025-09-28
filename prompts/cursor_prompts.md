# Cursor Prompts – QCSv1 Seed Backlog

> Role: You are **Cursor (Cursor App AI)**. You own UX writing and small UI scaffolds that help ship the Quote flow quickly.
> Sources of truth live in `qcsv1/context/`. Write your outputs to `qcsv1/outputs/cursor/` as `.md` (copy) or `.tsx` (UI stubs).

## Active

1) **Onboarding & Global Tone**

- Read: `context/project_overview.md`, `context/constraints.md`.
- Deliverables (to `outputs/cursor/`):
  - `brand_tone.md` — 6–8 bullet rules (voice, reading level, do/don’t).
  - `onboarding_copy.md` — headline, subhead, CTA, small-print for sign-in.
  - `system_messages.md` — short style guide for errors, toasts, empty states.

1) **Quote Wizard UX Copy (Create Quote)**

- Read: `context/workflows.md`, `context/ui_navigation.md`.
- Deliverables:
  - `quote_wizard_copy.md` with sections:
    - **Step 1: Basics** (rate card, monthly orders, AOV, units/order)
    - **Step 2: Shipping Mix** (S/M/L with %; note about auto-normalization)
    - **Step 3: Preview** (totals summary + “Save Quote” CTA)
  - Each field: label, helper, placeholder, validation messages.

1) **"Preview with Newer Rates" Banner**

- When saved quote uses older rate card:
  - Short banner (title + one-line explainer + primary/secondary CTAs).
  - Toast & error text variants.
- Deliverable: `preview_newer_banner.md`.

1) **Results / Detail Page Microcopy**

- For `/quotes/:id`:
  - Section headers for cost buckets (Storage, Fulfillment, Labor, CS, Surcharges, Admin).
  - Table labels, currency formatting notes, and empty states.
- Deliverable: `quote_detail_copy.md`.

1) **PDF Export Template (Text Only)**

- Draft headings, sections, and placeholder merge tags:
  - Client name, date, rate card version, bucket totals, notes.
- Deliverable: `quote_pdf_template.md`.

1) **UI Stubs (Optional)**

- Provide minimal React TSX stubs (Next.js compatible) with placeholders:
  - `ui/PreviewNewerBanner.tsx`
  - `ui/QuoteTotalsTable.tsx`
- Keep styling minimal; focus on props and content slots.
- Deliverable path: `outputs/cursor/ui/*.tsx`.

1) **Accessibility & QA Checklist**

- 12–15 bullets covering labels, focus order, color contrast, error recovery.
- Deliverable: `ux_a11y_checklist.md`.

1) **Handoff Note to Lisa**

- Summarize what changed and any open content questions.
- Deliverable: `cursor_handoff.md`.

## Completed
