import { quoteBreakdown } from '../../../../packages/calc/src/index.js';
import { rateCards } from '../data.js';
import { MemoryQuoteRepository } from './quote.repo.memory.js';

describe('QuoteService', () => {
  it('produces non-zero totals with canonical scope', () => {
    const rateCard = rateCards.find(r => r.id === 'rc-launch') || rateCards[0];
    const res = quoteBreakdown({
      monthlyOrders: 500,
      averageOrderValueCents: 10000,
      averageUnitsPerOrder: 1,
      shippingSizeMix: [
        { size: 'S', pct: 60 },
        { size: 'M', pct: 30 },
        { size: 'L', pct: 10 },
      ],
    }, rateCard);
    
    const totals = res.totalsCents;
    expect(totals).toBeTruthy();
    const sum = Object.values(totals).reduce((a: any, b: any) => a + Number(b || 0), 0);
    expect(sum).toBeGreaterThan(0);
  });

  it('handles different rate cards', () => {
    const rateCard = rateCards.find(r => r.id === 'rc-scale') || rateCards[0];
    const res = quoteBreakdown({
      monthlyOrders: 1000,
      averageOrderValueCents: 15000,
      averageUnitsPerOrder: 2,
      shippingSizeMix: [
        { size: 'S', pct: 40 },
        { size: 'M', pct: 50 },
        { size: 'L', pct: 10 },
      ],
    }, rateCard);
    
    const totals = res.totalsCents;
    expect(totals).toBeTruthy();
    expect(totals.grandTotal).toBeGreaterThan(0);
    expect(totals.Storage).toBeGreaterThan(0);
    expect(totals.Fulfillment).toBeGreaterThan(0);
  });

  it('creates and retrieves a quote by id', async () => {
    const repo = new MemoryQuoteRepository();
    const payload = {
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
      totalsCents: {
        Storage: 50000,
        Fulfillment: 30000,
        Labor: 75000,
        CS: 25000,
        Surcharges: 10000,
        Admin: 5000,
        grandTotal: 195000
      }
    };

    const created = await repo.save(payload);
    expect(typeof created.id).toBe('string');
    expect(created.id.length).toBeGreaterThan(0);
    
    const found = await repo.get(created.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.rateCardId).toBe('rc-launch');
    expect(found?.scopeInput.monthlyOrders).toBe(500);
    expect(found?.totalsCents.grandTotal).toBe(195000);
  });
});
