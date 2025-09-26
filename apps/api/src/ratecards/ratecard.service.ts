import { Injectable } from '@nestjs/common';

export interface RateCardTier {
    minMonthlyOrders: number; // inclusive threshold
    fulfillmentFeeCents: number; // per order
}

export interface RateCardDefinition {
    id: string;
    version: number;
    currency: string;
    tiers: RateCardTier[];
    createdAt: string;
}

// Simple in-memory rate cards (simulate versions)
const RATE_CARDS: RateCardDefinition[] = [
    {
        id: 'rc-launch',
        version: 1,
        currency: 'USD',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        tiers: [
            { minMonthlyOrders: 0, fulfillmentFeeCents: 250 },
            { minMonthlyOrders: 500, fulfillmentFeeCents: 200 },
            { minMonthlyOrders: 1000, fulfillmentFeeCents: 150 },
        ],
    },
    {
        id: 'rc-launch',
        version: 2,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        tiers: [
            { minMonthlyOrders: 0, fulfillmentFeeCents: 240 },
            { minMonthlyOrders: 500, fulfillmentFeeCents: 190 },
            { minMonthlyOrders: 1000, fulfillmentFeeCents: 140 },
        ],
    },
];

@Injectable()
export class RateCardService {
    listLatest(): RateCardDefinition[] {
        // Return only highest version per id (here single id)
        const latest: Record<string, RateCardDefinition> = {};
        for (const rc of RATE_CARDS) {
            const existing = latest[rc.id];
            if (!existing || existing.version < rc.version) {
                latest[rc.id] = rc;
            }
        }
        return Object.values(latest);
    }

    getLatestById(id: string): RateCardDefinition | undefined {
        return this.listAllById(id).sort((a, b) => b.version - a.version)[0];
    }

    listAllById(id: string): RateCardDefinition[] {
        return RATE_CARDS.filter(rc => rc.id === id).sort((a, b) => a.version - b.version);
    }

    getVersion(id: string, version: number): RateCardDefinition | undefined {
        return RATE_CARDS.find(rc => rc.id === id && rc.version === version);
    }
}
