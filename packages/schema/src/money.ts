// Money helpers for QCSv1 schema layer
// All monetary values internally handled in integer cents.

export function toCents(major: number | string): number {
  if (major == null || major === '') return 0;
  const n = typeof major === 'string' ? Number(major) : major;
  if (!Number.isFinite(n)) return 0;
  // round half up to nearest cent
  return Math.round(n * 100 + (n >= 0 ? 1e-8 : -1e-8));
}

export function toMajor(cents: number | string): number {
  if (cents == null || cents === '') return 0;
  const n = typeof cents === 'string' ? Number(cents) : cents;
  if (!Number.isFinite(n)) return 0;
  return n / 100;
}

export function isIntCents(v: any): v is number {
  return typeof v === 'number' && Number.isInteger(v);
}

export function ensureCentsField(obj: any, fieldMajor: string, fieldCents: string) {
  // If obj[fieldCents] present and integer, keep. Else if fieldMajor present, convert & assign to fieldCents.
  if (obj && typeof obj === 'object') {
    const centsVal = obj[fieldCents];
    if (!isIntCents(centsVal)) {
      const majorVal = obj[fieldMajor];
      if (majorVal != null) {
        obj[fieldCents] = toCents(majorVal);
      }
    }
    return obj;
  }
  return obj;
}
