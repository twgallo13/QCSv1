# QCSv1 Architecture Decisions

## 2025-09-28
- Decision: Adopt cents (integers) as the canonical monetary unit across QCSv1.
- Rationale: Avoid float rounding errors; consistent math across API/UI; standard practice.
- Impact: Schemas renamed to ...Cents; money utils (toCents/toMajor) created; API/web boundaries normalize & format.
