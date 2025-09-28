import { toCents, toMajor, ensureCentsField } from './money.ts';

describe('money helpers', () => {
  it('toCents converts major to integer cents (round half up)', () => {
    expect(toCents(0)).toBe(0);
    expect(toCents(1)).toBe(100);
    expect(toCents(1.23)).toBe(123);
    expect(toCents(1.235)).toBe(124); // half up
  });

  it('toMajor formats cents to fixed string', () => {
    expect(toMajor(0)).toBe('0.00');
    expect(toMajor(123)).toBe('1.23');
  });

  it('ensureCentsField populates cents from major fields', () => {
    const obj: any = { amount: 12.34 };
    ensureCentsField(obj, 'amount', 'amountCents');
    expect(obj.amountCents).toBe(1234);
  });
});
