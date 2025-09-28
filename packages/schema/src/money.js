// JS runtime wrapper for TypeScript money helpers (duplicated for runtime consumption)
export function toCents(major) {
  if (major == null || major === '') return 0;
  const n = typeof major === 'string' ? Number(major) : major;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100 + (n >= 0 ? 1e-8 : -1e-8));
}
export function toMajor(cents, locale = 'en-US', currency = 'USD') {
  if (cents == null || cents === '') return (0).toFixed(2);
  const n = typeof cents === 'string' ? Number(cents) : cents;
  if (!Number.isFinite(n)) return (0).toFixed(2);
  const major = n / 100;
  if (!currency) return major.toFixed(2);
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(major);
}
export function ensureCentsField(obj, fieldMajor, fieldCents) {
  if (obj && typeof obj === 'object') {
    const centsVal = obj[fieldCents];
    if (!(typeof centsVal === 'number' && Number.isInteger(centsVal))) {
      const majorVal = obj[fieldMajor];
      if (majorVal != null) {
        obj[fieldCents] = toCents(majorVal);
      }
    }
    return obj;
  }
  return obj;
}
