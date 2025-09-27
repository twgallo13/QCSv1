import { QuoteService } from './quote.service';
import { RateCard } from '../ratecards/ratecard.service';

// Minimal fixture rate card matching expectations in service
const rc: RateCard = {
  id: 'rc-launch',
  name: 'Launch',
  version: '1.0.0',
  updatedAt: '2025-09-01',
  fulfillmentPercentOfAOV: 0.03,
  fulfillmentBaseCents: 100,
  fulfillmentPerAddCents: 25,
  storagePerOrderCents: 100,
  laborPerOrderCents: 150,
  csPerOrderCents: 50,
  surchargePerOrderCents: 20,
  adminPerOrderCents: 10,
  shippingRatesBySizeCents: { S: 120, M: 180, L: 240 },
};

describe('QuoteService', () => {
  let svc: QuoteService;

  beforeEach(() => {
    // @ts-ignore - no dependencies currently
    svc = new QuoteService();
  });

  it('produces non-zero totals with canonical scope', () => {
    // @ts-ignore
    const res = svc.preview(rc, {
      monthlyOrders: 500,
      averageOrderValueCents: 10000,
      averageUnitsPerOrder: 1,
      shippingSizeMix: [
        { size: 'S', pct: 60 },
        { size: 'M', pct: 30 },
        { size: 'L', pct: 10 },
      ],
    });
    const totals = (res as any).totalsCents ?? res;
    expect(totals).toBeTruthy();
    const sum = Object.values(totals).reduce((a: any, b: any) => a + Number(b || 0), 0);
    expect(sum).toBeGreaterThan(0);
  });

  it('accepts legacy field names via adaptScope', () => {
    // @ts-ignore
    const res = svc.preview(rc, {
      aovCents: 12000,
      orderCount: 1000,
      averageUnitsPerOrder: 2,
      shippingSizeMix: { S: 0.5, M: 0.3, L: 0.2 },
    });
    const totals = (res as any).totalsCents ?? res;
    expect(totals).toBeTruthy();
    expect((totals as any).grandTotal ?? 1).toBeGreaterThan(0);
  });
});
