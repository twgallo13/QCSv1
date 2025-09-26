import { Injectable } from '@nestjs/common';
import type { RateCard } from '../ratecards/ratecard.service';

type ScopeInput = {
  monthlyOrders?: number;
  averageOrderValueCents?: number;
  averageUnitsPerOrder?: number;
  shippingSizeMix?: { size: string; pct: number }[];
};

@Injectable()
export class QuoteService {
  private quotes = new Map<string, any>();

  private roundHalfUp(n: number) { return n >= 0 ? Math.floor(n + 0.5) : Math.ceil(n - 0.5); }
  private normalizeMix(mix: { size: string; pct: number }[] = []) {
    const total = mix.reduce((s,m)=>s+(m?.pct??0),0);
    if (total>=99.5 && total<=100.5) {
      const scaled = mix.map(m=>({...m,pct:((m?.pct??0)*100)/total}));
      const rounded = scaled.map(m=>({...m,pct:Math.round(m.pct)}));
      const drift = 100 - rounded.reduce((s,m)=>s+m.pct,0);
      if (drift!==0){ let i=0,max=-Infinity; rounded.forEach((m,idx)=>{if(m.pct>max){max=m.pct;i=idx}}); rounded[i]={...rounded[i],pct:rounded[i].pct+drift}; }
      return { mix: rounded, mixAutoNormalized: true };
    }
    return { mix, mixAutoNormalized: false };
  }

  private breakdown(scope: ScopeInput, rc: RateCard) {
    const monthlyOrders = Number(scope.monthlyOrders ?? 0);
    const AOVc = Number(scope.averageOrderValueCents ?? 0);
    const UTP  = Number(scope.averageUnitsPerOrder ?? 1);
    const { mix } = this.normalizeMix(scope.shippingSizeMix || []);

    const fulfillPct   = rc.fulfillmentPercentOfAOV ?? 0.03;
    const fulfillBase  = rc.fulfillmentBaseCents ?? 100;
    const fulfillPerAdd= rc.fulfillmentPerAddCents ?? 25;
    const percentTerm  = this.roundHalfUp(AOVc * fulfillPct);
    const fulfilled    = Math.max(percentTerm, fulfillBase + fulfillPerAdd * Math.max(0, UTP - 1));

    const shipRates = rc.shippingRatesBySizeCents ?? { S:120, M:180, L:240 };
    const sandHPerOrder = (mix||[]).reduce((sum,m)=> sum + this.roundHalfUp((m.pct/100)*(shipRates[m.size] ?? 0)), 0);

    const Storage    = (rc.storagePerOrderCents   ?? 100) * monthlyOrders;
    const Fulfillment= (fulfilled * monthlyOrders) + (sandHPerOrder * monthlyOrders);
    const Labor      = (rc.laborPerOrderCents     ?? 150) * monthlyOrders;
    const CS         = (rc.csPerOrderCents        ?? 50)  * monthlyOrders;
    const Surcharges = (rc.surchargePerOrderCents ?? 20)  * monthlyOrders;
    const Admin      = (rc.adminPerOrderCents     ?? 10)  * monthlyOrders;
    const grandTotal = Storage + Fulfillment + Labor + CS + Surcharges + Admin;

    return { ok:true, totalsCents:{ Storage, Fulfillment, Labor, CS, Surcharges, Admin, grandTotal }, meta:{engine:'qcsv1-nest-inline'} };
  }

  preview(rateCard: RateCard, input: ScopeInput) { return this.breakdown(input, rateCard); }
  create(rateCard: RateCard, input: ScopeInput) {
    const id = Math.random().toString(36).slice(2,10);
    const record = { id, rateCardId: rateCard.id, input, ...this.breakdown(input, rateCard), createdAt: new Date().toISOString() };
    this.quotes.set(id, record);
    return { id };
  }
  get(id: string) { return this.quotes.get(id) ?? null; }
}
