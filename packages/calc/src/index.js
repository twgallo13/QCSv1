// Integer-cents helpers
export function roundHalfUp(n) {
  // n is number of cents already or an intermediate; we round to integer cents
  // 0.5 rounds away from zero
  return (n >= 0) ? Math.floor(n + 0.5) : Math.ceil(n - 0.5);
}

export function toCentsFromDollars(dollars) {
  // dollars may be number; convert safely to integer cents
  return roundHalfUp(Number(dollars) * 100);
}

export function normalizeMix(mixArray /* [{size, pct}] */) {
  const total = mixArray.reduce((s, m) => s + Number(m.pct || 0), 0);
  if (total >= 99.5 && total <= 100.5) {
    // scale to exactly 100 keeping proportions
    const scaled = mixArray.map(m => ({ ...m, pct: (Number(m.pct || 0) * 100) / total }));
    // fix rounding drift by adjusting the largest to make sum 100
    const rounded = scaled.map(m => ({ ...m, pct: Math.round(m.pct) }));
    const drift = 100 - rounded.reduce((s, m) => s + m.pct, 0);
    if (drift !== 0) {
      let idx = 0; let max = -Infinity;
      rounded.forEach((m, i) => { if (m.pct > max) { max = m.pct; idx = i; } });
      rounded[idx] = { ...rounded[idx], pct: rounded[idx].pct + drift };
    }
    return { mix: rounded, mixAutoNormalized: true };
  }
  return { mix: mixArray, mixAutoNormalized: false };
}

// Very small placeholder formulas that are deterministic & integer-safe.
// Later, replace with full business math. For now we keep it predictable.
function calcFulfillmentPerOrder(AOVc, pctOrBasis, baseCents, perAddCents, unitsPerOrder) {
  const percentTerm = roundHalfUp(AOVc * (Number(pctOrBasis) || 0));
  const stepped = baseCents + perAddCents * Math.max(0, (unitsPerOrder || 1) - 1);
  return Math.max(percentTerm, stepped);
}

function calcSandHBlendedPerOrder(mix, rateBySizeCents) {
  // Round each term pct*rate before summing
  let total = 0;
  for (const m of mix) {
    const rate = Number(rateBySizeCents[m.size] || 0);
    total += roundHalfUp((Number(m.pct || 0) / 100) * rate);
  }
  return total;
}

export function quoteBreakdown(scopeInput, rateCard) {
  // scopeInput: { monthlyOrders, averageOrderValueCents, averageUnitsPerOrder, shippingSizeMix: [{size,pct}] }
  const monthlyOrders = Number(scopeInput.monthlyOrders || 0);
  const AOVc = Number(scopeInput.averageOrderValueCents || 0);
  const UTP = Number(scopeInput.averageUnitsPerOrder || 1);

  const { mix, mixAutoNormalized } = normalizeMix(scopeInput.shippingSizeMix || []);

  // Rate card fields (simple defaults so engine always runs)
  const rc = rateCard || {};
  const storagePerOrderCents   = Number(rc.storagePerOrderCents   ?? 100);   // $1.00
  const laborPerOrderCents     = Number(rc.laborPerOrderCents     ?? 150);   // $1.50
  const csPerOrderCents        = Number(rc.csPerOrderCents        ?? 50);    // $0.50
  const surchargePerOrderCents = Number(rc.surchargePerOrderCents ?? 20);    // $0.20
  const adminPerOrderCents     = Number(rc.adminPerOrderCents     ?? 10);    // $0.10

  // Fulfillment rule: max(percent of AOV, base + perAdd*(UTP-1))
  const fulfillPct               = Number(rc.fulfillmentPercentOfAOV || 0.03); // 3% default
  const fulfillBaseCents         = Number(rc.fulfillmentBaseCents    || 100);  // $1.00
  const fulfillPerAddUnitCents   = Number(rc.fulfillmentPerAddCents  || 25);   // $0.25 per extra unit

  // Shipping & Handling blended per-order using mix
  const shippingRatesBySizeCents = rc.shippingRatesBySizeCents || { S: 120, M: 180, L: 240 }; // $1.20/$1.80/$2.40

  const fulfillmentPerOrder = calcFulfillmentPerOrder(AOVc, fulfillPct, fulfillBaseCents, fulfillPerAddUnitCents, UTP);
  const sandHPerOrder       = calcSandHBlendedPerOrder(mix, shippingRatesBySizeCents);

  const perOrder =
    storagePerOrderCents +
    fulfillmentPerOrder +
    laborPerOrderCents +
    csPerOrderCents +
    sandHPerOrder +
    surchargePerOrderCents +
    adminPerOrderCents;

  // Monthly totals are per-order * monthlyOrders (still cents)
  const Storage    = storagePerOrderCents   * monthlyOrders;
  const Fulfillment= fulfillmentPerOrder    * monthlyOrders;
  const Labor      = laborPerOrderCents     * monthlyOrders;
  const CS         = csPerOrderCents        * monthlyOrders;
  const Surcharges = surchargePerOrderCents * monthlyOrders;
  const Admin      = adminPerOrderCents     * monthlyOrders;

  // We keep shipping inside Fulfillment bucket for now? (spec varies by org).
  // To make it explicit, add S&H into Fulfillment:
  const Shipping   = sandHPerOrder * monthlyOrders;
  const FulfillmentWithShip = Fulfillment + Shipping;

  const grandTotal = Storage + FulfillmentWithShip + Labor + CS + Surcharges + Admin;

  return {
    ok: true,
    normalization: { mixAutoNormalized },
    totalsCents: { Storage, Fulfillment: FulfillmentWithShip, Labor, CS, Surcharges, Admin, grandTotal },
    meta: { engine: "qcsv1-calc", note: "Integer-cents placeholder formulas" }
  };
}
