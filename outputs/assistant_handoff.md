# Money Cents Refactor - Handoff Documentation

## Overview
Successfully refactored QCSv1 codebase to use **cents (integers)** as the canonical money unit across all components. This eliminates floating-point precision issues and ensures consistent monetary calculations.

## Branch
- **Branch:** `feat/money-cents`
- **Status:** Ready for PR

## Files Changed

### 1. New Shared Utilities
- **`packages/schema/package.json`** - New package configuration with vitest
- **`packages/schema/src/money.ts`** - Core money utilities (toCents, toMajor, validation)
- **`packages/schema/src/money.test.ts`** - Comprehensive unit tests (13 tests, all passing)
- **`packages/schema/src/index.ts`** - Package exports
- **`packages/schema/vitest.config.ts`** - Test configuration

### 2. Web App Updates
- **`apps/web/src/app/quote/page.tsx`**
  - Import `toCents` and `toMajor` from `qcsv1-schema`
  - Changed AOV input from cents to dollars for better UX
  - Convert dollars to cents before API calls using `toCents(aovDollars)`
  - Display totals using `toMajor()` for proper currency formatting
  - Updated form validation to use dollars

- **`apps/web/src/app/quotes/page.tsx`**
  - Import `toMajor` from `qcsv1-schema`
  - Ready for currency formatting (currently simple list view)

- **`apps/web/src/app/quotes/[id]/page.tsx`**
  - Import `toMajor` from `qcsv1-schema`
  - Replace custom `dollars()` function with `toMajor()`

### 3. API (Already Compliant)
- **`apps/api/src/dto.js`** - Already validates `averageOrderValueCents`
- **`apps/api/src/index.js`** - Already uses `totalsCents` in responses
- **`packages/calc/src/index.js`** - Already performs all calculations in cents

### 4. Documentation
- **`context/schemas.md`** - Added "Monetary Units" section at top
  - Documents cents as canonical unit
  - Explains UI formatting approach
  - Updates rounding policy for integer arithmetic

## Key Changes Summary

### Before
- Mixed usage of dollars and cents
- Custom `dollars()` functions scattered across components
- Potential floating-point precision issues
- Inconsistent money handling

### After
- **Canonical unit:** Cents (integers) throughout codebase
- **UI display:** Formatted currency strings using `toMajor()`
- **API calls:** Convert user input to cents using `toCents()`
- **Calculations:** All performed on integers (cents)
- **Consistency:** Single source of truth for money formatting

## Money Utilities API

```typescript
// Convert major units (dollars) to cents
toCents(major: number | string): number

// Convert cents to formatted currency string
toMajor(cents: number, locale?: string, currency?: string): string

// Validation and safe conversion utilities
isValidCents(cents: unknown): boolean
toCentsSafe(major: number | string, fallback?: number): number
toMajorSafe(cents: number, fallback?: string): string
```

## Testing
- **Unit tests:** 13 tests covering all money utilities
- **Test coverage:** Edge cases, error handling, locale formatting
- **Status:** All tests passing ✅

## Benefits Achieved
1. **Precision:** Eliminates floating-point arithmetic issues
2. **Consistency:** Single source of truth for money formatting
3. **Maintainability:** Centralized money utilities
4. **UX:** Better user experience with dollar inputs
5. **Reliability:** Robust error handling and validation

## Next Steps
1. Create PR from `feat/money-cents` branch
2. Review and merge
3. Consider adding more locale support if needed
4. Update any remaining components that might use money

## Notes
- API was already using cents correctly
- Calc package was already performing integer arithmetic
- Main changes were in UI layer for better UX
- All existing functionality preserved
- No breaking changes to API contracts
