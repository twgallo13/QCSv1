/// <reference types="@types/jest" />
import supertest from 'supertest';
import express from 'express';
import cors from 'cors';
import { rateCards } from './data.js';
import { quoteBreakdown } from '../../../packages/calc/src/index.js';
import { validateRequest } from './dto.js';

function buildApp() {
  const app = express();
  app.use(cors({ origin: [/\.app\.github\.dev$/, 'http://localhost:3001'], credentials: true }));
  app.use(express.json());

  app.post('/quotes/preview', validateRequest(), (req: any, res: any) => {
    const { rateCardId, scopeInput } = req.validatedBody;
    const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
    const result = quoteBreakdown(scopeInput, rateCard);
    const normalizedScope = { ...scopeInput, averageOrderValueCents: Number(scopeInput.averageOrderValueCents || 0) };
    return res.json({ ...result, scopeInput: normalizedScope });
  });
  return app;
}

describe('POST /quotes/preview money normalization', () => {
  it('accepts averageOrderValueMajor and converts to averageOrderValueCents', async () => {
    const app = buildApp();
    const payload = {
      rateCardId: 'rc-launch',
      scopeInput: {
        monthlyOrders: 10,
        averageOrderValueMajor: 123.45,
        averageUnitsPerOrder: 1,
        shippingSizeMix: [
          { size: 'S', pct: 60 },
          { size: 'M', pct: 30 },
          { size: 'L', pct: 10 }
        ]
      }
    };

    const res = await supertest(app)
      .post('/quotes/preview')
      .send(payload)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.ok).toBe(true);
    expect(res.body.scopeInput.averageOrderValueCents).toBe(12345);
    expect(res.body.totalsCents.grandTotal).toBeGreaterThan(0);
  });
});
