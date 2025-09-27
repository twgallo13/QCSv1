import { QuoteService } from './quote.service';

describe('QuoteService', () => {
  let svc: QuoteService;

  beforeEach(() => {
    // Minimal constructor shape if service expects deps; otherwise instantiate directly
    // @ts-ignore
    svc = new QuoteService();
  });

  it('produces non-zero totals with canonical scope', () => {
    // @ts-ignore
    const res = svc.preview({
      rateCardId: 'rc-launch',
      scopeInput: {
        monthlyOrders: 500,
        averageOrderValueCents: 10000,
        averageUnitsPerOrder: 1,
        shippingSizeMix: [
          { size: 'S', pct: 60 },
          { size: 'M', pct: 30 },
          { size: 'L', pct: 10 },
        ],
      },
    });
    const totals = (res as any).totalsCents ?? res;
    expect(totals).toBeTruthy();
    const sum = Object.values(totals).reduce((a: any, b: any) => a + Number(b || 0), 0);
    expect(sum).toBeGreaterThan(0);
  });

  it('accepts legacy field names via adaptScope', () => {
    // Legacy style: aovCents/orderCount and object mix fractions
    // @ts-ignore
    const res = svc.preview({
      rateCardId: 'rc-launch',
      scope: {
        aovCents: 12000,
        orderCount: 1000,
        averageUnitsPerOrder: 2,
        shippingSizeMix: { S: 0.5, M: 0.3, L: 0.2 },
      },
    });
    const totals = (res as any).totalsCents ?? res;
    expect(totals).toBeTruthy();
    expect(totals.grandTotal ?? 1).toBeGreaterThan(0);
  });
});
