# Homer Handoff – Cents Normalization Feature

## Branch

feat/api-cents-boundary

## Summary

Implemented request boundary normalization for monetary amounts. Incoming major-unit average order values (e.g. `averageOrderValueMajor: 123.45`) are converted into integer cents (`averageOrderValueCents: 12345`) before reaching the calc engine. Responses from preview and create quote endpoints now include a normalized `scopeInput.averageOrderValueCents` to make the internal representation explicit.

## Key Changes

- Added `packages/schema/src/money.ts` with helpers: `toCents`, `toMajor`, `ensureCentsField`.
- Extended `apps/api/src/dto.js` validation middleware to accept `averageOrderValueMajor` (or legacy `averageOrderValue`) and populate `averageOrderValueCents`.
- Updated `/quotes/preview` and `/quotes` endpoints to return normalized scope including `averageOrderValueCents`.
- Added integration test `apps/api/src/preview.integration.spec.ts` verifying major-unit input is normalized.

## Tests

- API integration test passes (Jest) confirming cents normalization and non-zero totals.
- (Planned) Schema unit tests draft created but not yet wired due to ESM Jest config complexity; can finalize in follow-up if desired.

## Follow Ups (Optional)

1. Finalize schema package Jest ESM setup (or simplify by outputting JS compiled sources) to enable `money.spec.ts`.
2. Add additional validation: reject when both `averageOrderValueCents` and a major field conflict (mismatch > 1 cent).
3. Expose formatted major string in responses (e.g. `averageOrderValueMajor: "123.45"`).
4. Add more integration tests for `/quotes` persistence and edge cases (zero values, large numbers, shipping mix auto-normalization).

## PR Metadata

Title: feat(api): normalize money to cents at request boundary + tests
Body:

- Normalize incoming money fields (`averageOrderValueMajor` / `averageOrderValue`) -> `averageOrderValueCents`.
- Added schema money helpers (`toCents`, `toMajor`, `ensureCentsField`).
- Updated preview & create quote endpoints to include normalized `scopeInput`.
- Added integration test for POST /quotes/preview using major-unit input.

Ready for review.
