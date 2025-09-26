import { Injectable, NotFoundException } from '@nestjs/common';
import { RateCardService, RateCardDefinition } from '../ratecards/ratecard.service';
import { randomUUID } from 'crypto';

export interface ScopeInput {
    monthlyOrders: number;
    averageOrderValueCents: number;
    averageUnitsPerOrder: number;
    shippingSizeMix?: { size: string; pct: number }[]; // optional
}

export interface QuoteRecord {
    id: string;
    rateCardId: string;
    rateCardVersion: number;
    scopeInput: ScopeInput;
    totals: QuoteTotals;
    createdAt: string;
}

export interface QuoteTotals {
    fulfillmentCostCents: number;
    avgFulfillmentCostPerOrderCents: number;
}

export interface QuotePreviewResponse {
    rateCard: { id: string; version: number };
    scopeInput: ScopeInput;
    totals: QuoteTotals;
}

export interface QuoteSavedResponse extends QuotePreviewResponse {
    id: string;
    createdAt: string;
}

export interface PreviewNewerDiffResponse {
    saved: QuoteSavedResponse;
    newer: QuotePreviewResponse | null; // null if no newer version
    diff: {
        fulfillmentCostCents: number | null;
        avgFulfillmentCostPerOrderCents: number | null;
    };
}

// In-memory store
const QUOTES: QuoteRecord[] = [];

@Injectable()
export class QuoteService {
    constructor(private readonly rateCards: RateCardService) { }

    private pickRateCardVersion(rcId: string): RateCardDefinition {
        const latest = this.rateCards.getLatestById(rcId);
        if (!latest) throw new NotFoundException('Rate card not found');
        return latest;
    }

    private calculateTotals(rc: RateCardDefinition, scope: ScopeInput): QuoteTotals {
        // Pick tier based on monthly orders (highest minMonthlyOrders <= monthlyOrders)
        const tier = rc.tiers
            .filter(t => t.minMonthlyOrders <= scope.monthlyOrders)
            .sort((a, b) => b.minMonthlyOrders - a.minMonthlyOrders)[0];

        const feePerOrder = tier.fulfillmentFeeCents;
        const fulfillmentCostCents = scope.monthlyOrders * feePerOrder;
        const avg = feePerOrder; // simplified
        return {
            fulfillmentCostCents,
            avgFulfillmentCostPerOrderCents: avg,
        };
    }

    preview(rateCardId: string, scope: ScopeInput): QuotePreviewResponse {
        const rc = this.pickRateCardVersion(rateCardId);
        const totals = this.calculateTotals(rc, scope);
        return {
            rateCard: { id: rc.id, version: rc.version },
            scopeInput: scope,
            totals,
        };
    }

    save(rateCardId: string, scope: ScopeInput): QuoteSavedResponse {
        const preview = this.preview(rateCardId, scope);
        const record: QuoteRecord = {
            id: randomUUID(),
            rateCardId,
            rateCardVersion: preview.rateCard.version,
            scopeInput: scope,
            totals: preview.totals,
            createdAt: new Date().toISOString(),
        };
        QUOTES.push(record);
        return { id: record.id, createdAt: record.createdAt, ...preview };
    }

    get(id: string): QuoteSavedResponse {
        const rec = QUOTES.find(q => q.id === id);
        if (!rec) throw new NotFoundException('Quote not found');
        return {
            id: rec.id,
            createdAt: rec.createdAt,
            rateCard: { id: rec.rateCardId, version: rec.rateCardVersion },
            scopeInput: rec.scopeInput,
            totals: rec.totals,
        };
    }

    previewNewer(id: string): PreviewNewerDiffResponse {
        const saved = this.get(id);
        const latest = this.rateCards.getLatestById(saved.rateCard.id);
        if (!latest) {
            return { saved, newer: null, diff: { fulfillmentCostCents: null, avgFulfillmentCostPerOrderCents: null } };
        }
        if (latest.version === saved.rateCard.version) {
            return { saved, newer: null, diff: { fulfillmentCostCents: null, avgFulfillmentCostPerOrderCents: null } };
        }
        const newerPreview = this.preview(saved.rateCard.id, saved.scopeInput);
        return {
            saved,
            newer: newerPreview,
            diff: {
                fulfillmentCostCents: newerPreview.totals.fulfillmentCostCents - saved.totals.fulfillmentCostCents,
                avgFulfillmentCostPerOrderCents:
                    newerPreview.totals.avgFulfillmentCostPerOrderCents - saved.totals.avgFulfillmentCostPerOrderCents,
            },
        };
    }
}
