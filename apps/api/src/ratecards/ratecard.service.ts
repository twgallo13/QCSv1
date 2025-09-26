import { Injectable } from '@nestjs/common';

export type RateCard = {
    id: string;
    name: string;
    version: string;
    updatedAt: string;
    fulfillmentPercentOfAOV?: number;
    fulfillmentBaseCents?: number;
    fulfillmentPerAddCents?: number;
    storagePerOrderCents?: number;
    laborPerOrderCents?: number;
    csPerOrderCents?: number;
    surchargePerOrderCents?: number;
    adminPerOrderCents?: number;
    shippingRatesBySizeCents?: Record<string, number>;
};

@Injectable()
export class RatecardService {
    private rateCards: RateCard[] = [
        {
            id: 'rc-launch', name: 'Launch', version: '1.0.0', updatedAt: '2025-09-01',
            fulfillmentPercentOfAOV: 0.03, fulfillmentBaseCents: 100, fulfillmentPerAddCents: 25,
            storagePerOrderCents: 100, laborPerOrderCents: 150, csPerOrderCents: 50,
            surchargePerOrderCents: 20, adminPerOrderCents: 10,
            shippingRatesBySizeCents: { S: 120, M: 180, L: 240 },
        },
        {
            id: 'rc-scale', name: 'Scale', version: '1.0.0', updatedAt: '2025-09-10',
            fulfillmentPercentOfAOV: 0.028, fulfillmentBaseCents: 120, fulfillmentPerAddCents: 30,
            storagePerOrderCents: 90, laborPerOrderCents: 140, csPerOrderCents: 45,
            surchargePerOrderCents: 18, adminPerOrderCents: 10,
            shippingRatesBySizeCents: { S: 110, M: 170, L: 230 },
        },
    ];

    list() { return { items: this.rateCards }; }
    getById(id: string) { return this.rateCards.find(r => r.id === id) ?? null; }
    latest() { return { item: this.rateCards[this.rateCards.length - 1] }; }

    createDraft(partial: Partial<RateCard> = {}) {
        const id = `rc-${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date().toISOString().slice(0,10);
        const item: RateCard = {
            id, name: partial.name ?? 'Custom', version: '1.0.0', updatedAt: now,
            fulfillmentPercentOfAOV: 0.03, fulfillmentBaseCents: 100, fulfillmentPerAddCents: 25,
            storagePerOrderCents: 100, laborPerOrderCents: 150, csPerOrderCents: 50,
            surchargePerOrderCents: 20, adminPerOrderCents: 10,
            shippingRatesBySizeCents: { S: 120, M: 180, L: 240 },
            ...partial,
        };
        this.rateCards.push(item);
        return { item };
    }
}
