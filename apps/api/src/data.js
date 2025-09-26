export const rateCards = [
  { id:"rc-launch", name:"Launch", version:"1.0.0", updatedAt:"2025-09-01",
    fulfillmentPercentOfAOV:0.03, fulfillmentBaseCents:100, fulfillmentPerAddCents:25,
    storagePerOrderCents:100, laborPerOrderCents:150, csPerOrderCents:50,
    surchargePerOrderCents:20, adminPerOrderCents:10,
    shippingRatesBySizeCents:{S:120,M:180,L:240}
  },
  { id:"rc-scale", name:"Scale", version:"1.0.0", updatedAt:"2025-09-10",
    fulfillmentPercentOfAOV:0.028, fulfillmentBaseCents:120, fulfillmentPerAddCents:30,
    storagePerOrderCents:90, laborPerOrderCents:140, csPerOrderCents:45,
    surchargePerOrderCents:18, adminPerOrderCents:10,
    shippingRatesBySizeCents:{S:110,M:170,L:230}
  },
  { id:"rc-prime", name:"Prime", version:"1.0.0", updatedAt:"2025-09-26",
    fulfillmentPercentOfAOV:0.025, fulfillmentBaseCents:150, fulfillmentPerAddCents:35,
    storagePerOrderCents:80, laborPerOrderCents:130, csPerOrderCents:40,
    surchargePerOrderCents:15, adminPerOrderCents:8,
    shippingRatesBySizeCents:{S:100,M:160,L:220}
  }
];

export const quotes = new Map();
