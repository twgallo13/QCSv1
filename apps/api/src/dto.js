// Lightweight manual validation replacing class-validator decorators for plain JS runtime.
// We keep exported symbol names (PreviewDto) for minimal changes in index.js, though they are simple factory functions now.

import { ensureCentsField } from '../../../packages/schema/src/money.js';

export function validatePreviewPayload(body) {
  const errors = [];
  const isInt = (v) => Number.isInteger(v);
  const nonNeg = (v) => isInt(v) && v >= 0;

  if (body.rateCardId != null && typeof body.rateCardId !== 'string') {
    errors.push('rateCardId must be a string when provided');
  }

  if (typeof body.scopeInput !== 'object' || body.scopeInput == null) {
    errors.push('scopeInput is required');
  } else {
    const s = body.scopeInput;

    // Normalize averageOrderValueMajor -> averageOrderValueCents (if provided)
    ensureCentsField(s, 'averageOrderValue', 'averageOrderValueCents');
    ensureCentsField(s, 'averageOrderValueMajor', 'averageOrderValueCents');

    if (!nonNeg(s.monthlyOrders)) errors.push('scopeInput.monthlyOrders must be a non-negative integer');
    if (!nonNeg(s.averageOrderValueCents)) errors.push('scopeInput.averageOrderValueCents must be a non-negative integer');
    if (s.averageUnitsPerOrder != null && (!isInt(s.averageUnitsPerOrder) || s.averageUnitsPerOrder < 1)) {
      errors.push('scopeInput.averageUnitsPerOrder must be an integer >= 1 when provided');
    }
    if (s.shippingSizeMix != null) {
      if (!Array.isArray(s.shippingSizeMix)) {
        errors.push('scopeInput.shippingSizeMix must be an array when provided');
      } else {
        let totalPct = 0;
        s.shippingSizeMix.forEach((m, idx) => {
          if (typeof m.size !== 'string') errors.push(`shippingSizeMix[${idx}].size must be string`);
          if (!isInt(m.pct) || m.pct < 0 || m.pct > 100) errors.push(`shippingSizeMix[${idx}].pct must be int 0-100`);
          else totalPct += m.pct;
        });
        if (totalPct > 0 && (totalPct < 99 || totalPct > 101)) { // allow minor drift
          errors.push('shippingSizeMix pct values should sum to ~100');
        }
      }
    }
  }
  return errors;
}

// Placeholder exported class name to minimize refactor surface. Not instantiated, only semantic.
export class PreviewDto {}

export function validateRequest() {
  return (req, res, next) => {
    const errors = validatePreviewPayload(req.body || {});
    if (errors.length) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR', details: errors });
    }
    req.validatedBody = req.body;
    next();
  };
}
