QCSv1 — Master Schemas
======================

## Monetary Units
**Canonical unit: cents (integers); UI formats to major units.**

All monetary values are stored and calculated as integers representing cents to avoid floating-point precision issues. The UI displays these values as formatted currency strings (e.g., "$1,234.56").

- **Storage:** All money fields use `...Cents` suffix (e.g., `totalCents`, `feeCents`)
- **API:** Accepts and returns cents as integers
- **UI:** Converts to/from major units for display using `toCents()` and `toMajor()` utilities
- **Calculations:** All arithmetic performed on cents (integers)
- **Rounding:** Round to nearest cent using `Math.round()` for consistency

## 6.0 Global Conventions
- **ID format:** Firestore auto-ID (string); stable foreign reference via explicit code for catalog-like entities (e.g., `service.code`).  
- **Timestamps:** `createdAt`, `updatedAt` in ISO string (UTC). Set by server.  
- **Currency:** Store numbers in **cents (integers)** (e.g., 1234 for $12.34).  
  - **Rounding policy:**  
    1. Compute each line subtotal = qty × rate → round to nearest cent (integer).  
    2. Sum subtotals within bucket → sum integers (no rounding needed).  
    3. Apply discount to **discountable subtotal** only → round to nearest cent.  
    4. Grand total = sum(buckets) – discount → integer result.  
- **Enums:** Strings; validated in API & UI.  
- **Soft delete:** `archived: boolean` where applicable (rate cards), or immutable snapshots (quotes).  
- **Visibility:** `vendor | internal | both` governs exports.  
- **Buckets:** Storage | Fulfillment | Labor | CS | Surcharge | Admin.  
  - **"4 pillar"** = Storage, Fulfillment, Labor, CS (Surcharge/Admin excluded from discount).  

---

## 6.1 Service Catalog (global)

**Collection:** `services/{code}`  
**Purpose:** Canonical definitions referenced by rate cards and quote lines.  
**Used by:** Rate Card Services matrix, Quote lines (name/unit), Exports.  

```json
{
  "code": "STOR_BIN_S",        // unique immutable key
  "name": "Small Bin / day",
  "category": "Storage",       // enum: Storage|Fulfillment|Receiving|VAS|CS|Surcharge|Admin
  "pricingType": "per_unit",   // enum: flat|per_unit|per_order|per_style|per_hour|percent_of_invoice
  "unit": "bin_day",           // enum values below
  "visibility": "both",        // enum: vendor|internal|both
  "discountable": true,        // default true
  "description": "Small bin daily storage charge",
  "createdAt": "2025-09-25T00:00:00Z",
  "updatedAt": "2025-09-25T00:00:00Z"
}
Allowed unit values:

Capacity/time: bin_day, shelf_day, pallet_day

Counts: unit, order, carton, pallet, style, request, hour, event

Percent: percent

Validation:

code required, [A-Z0-9_]+, 3–32 chars.

pricingType must be compatible with unit (e.g., percent_of_invoice ↔ percent).

6.2 Rate Card
Collection: rate_cards/{id}

json
Copy code
{
  "name": "Master Card",
  "versionLabel": "v2025Q3",
  "status": "active",          // enum: draft|active|archived
  "discountPercent": 0,        // 0–100; applied only to discountable categories
  "archived": false,
  "notesVendor": "Carrier billed at cost...",
  "notesInternal": "Admin fees contract-only",
  "createdAt": "2025-09-25T00:00:00Z",
  "updatedAt": "2025-09-25T00:00:00Z"
}
Subcollection: tiers/{tierId}
json
Copy code
{
  "tierKey": "scale",      // launch|scale|prime|custom...
  "name": "Scale",
  "rank": 2,               // display/order precedence
  "rules": {
    "orders": [501, 2000], // [min, max], null = open-ended
    "gmv": [50000, 200000],
    "bins": [100, 500]
  },
  "createdAt": "...",
  "updatedAt": "..."
}
Validation: No overlap among tier rules for the same metric within a card. If overlaps exist, block publish.

Subcollection: prices/{priceId}
json
Copy code
{
  "serviceCode": "STOR_BIN_S", // FK to services.{code}
  "tierKey": "scale",          // null → global (flat)
  "defaultRate": 1.25,         // money or percent based on service.unit
  "visibility": "both",        // optional override of service visibility
  "floorRate": null,           // optional pricing floor for governance
  "createdAt": "...",
  "updatedAt": "..."
}
Resolution algorithm:

Look for exact (service, tierKey) price; else

Use global (tierKey=null); else

Fallback to Scale tier if exists; log audit rate_missing_fallback.

Indices:

rate_cards.status

tiers.tierKey, tiers.rank

prices.serviceCode+tierKey

Traceability: Used in UC-1, UC-2, UC-3, UC-6.

6.3 Quote
Collection: quotes/{id}

json
Copy code
{
  "name": "Acme Apparel — Oct v1",
  "vendorName": "Acme Apparel",
  "rateCardId": "abc123",
  "rateCardVersionLabel": "v2025Q3", // snapshot for traceability
  "meta": {
    "rateCardType": "harmonized",    // tiered|flat|harmonized
    "resolvedTier": "scale",         // null for flat/harmonized if not used
    "vasPreset": "Apparel",          // optional
    "branding": {                    // snapshot for exports
      "name": "Collab3PL",
      "logoUrl": "https://...",
      "colors": { "primary":"#111827", "accent":"#0EA5E9" }
    }
  },
  "inputs": {
    "monthlyOrders": 1000,
    "targetMonthlySpend": 8500,
    "gmv": 95000,
    "receiving": {
      "mode": "unit",        // unit|carton|pallet
      "units": 12000,
      "cartons": 0,
      "pallets": 0
    },
    "storage": {
      "mode": "bins",        // bins|shelves
      "smallBins": 100,
      "mediumBins": 40,
      "largeBins": 0,
      "shelves": 10,
      "pallets": 5
    },
    "fulfillment": {
      "unitsPerOrder": 2.1,  // default min 1 if orders >0
      "insurance": true
    },
    "vas": {
      "labelingUnits": 6000,
      "polybagUnits": 4000,
      "qcUnits": 1200,
      "returnsUnits": 960,
      "disposalUnits": 50,
      "kittingHours": 35,
      "cycleCountRequests": 2,
      "photoStyles": 12,
      "customHours": 0
    },
    "csPackage": "scale"     // launch|scale|prime
  },
  "discountPercent": 4.23,
  "totals": {
    "storage": 3250.00,
    "fulfillment": 4100.00,
    "labor": 850.00,
    "cs": 675.00,
    "surcharge": 0.00,
    "admin": 0.00,
    "discountAmount": 375.00,
    "grandTotal": 8500.00
  },
  "status": "draft",         // draft|finalized|exported
  "createdBy": "uid_123",
  "createdAt": "2025-09-25T00:00:00Z",
  "updatedAt": "2025-09-25T00:00:00Z"
}
Subcollection: lines/{lineId}
Immutable snapshot rows once finalized; re-generated on re-calc while draft.

json
Copy code
{
  "serviceCode": "FULL_FIRST",
  "name": "First Unit / order",
  "bucket": "Fulfillment",
  "qty": 1000,
  "unit": "order",
  "rate": 2.50,
  "subtotal": 2500.00,
  "visibility": "both",
  "badge": "Included",       // Included|Optional|Add-on
  "tierKey": "scale",
  "notes": null
}
Validation:

monthlyOrders ≥ 0; if >0 then unitsPerOrder ≥ 1 (auto-fix with warning).

Harmonized requires targetMonthlySpend.

Buckets must be in allowed set; discount applies only to discountable buckets.

Snapshot Policy:

On finalize, store resolved rates on each line (immutable).

Drafts re-calc using current active rate card until finalized.

Indices:

quotes.status, quotes.meta.rateCardType, quotes.meta.resolvedTier, quotes.vendorName

6.4 Competitor Rate Set (optional, internal)
Collection: competitor_rate_sets/{id} or nested under quotes/{id}/competitor

json
Copy code
{
  "quoteId": "xyz123",
  "name": "ShipFast Inc — Oct",
  "inputs": {
    "monthlyOrders": 1000,
    "monthlyTotal": 9200
  },
  "notesInternal": "Competitor waived CS package per sales call",
  "createdAt": "...",
  "updatedAt": "..."
}
Usage: Internal-only delta card in Quote view; never exported to vendor.

6.5 Settings
Collection: settings/{orgId}

json
Copy code
{
  "branding": {
    "name": "Collab3PL",
    "logoUrl": "https://storage.googleapis.com/.../logo.svg",
    "colors": { "primary": "#111827", "accent": "#0EA5E9" }
  },
  "governance": {
    "maxDiscount": 15,  // % cap for harmonization
    "floorRates": {
      "FULL_FIRST": 2.25,
      "VAS_KIT": 30.00
    },
    "discountableCategories": ["Receiving","Storage","Fulfillment","VAS","CS"]
  },
  "features": {
    "competitorModule": true,
    "commandPalette": false
  },
  "createdAt": "...",
  "updatedAt": "..."
}
Validation:

maxDiscount 0–50.

floorRates numbers ≥ 0.

discountableCategories subset of allowed categories.

Governance Defaults (initial seed):

javascript
Copy code
{
  "governance": {
    "maxDiscount": 15,
    "floorRates": {
      "FULL_FIRST": 2.25,
      "FULL_ADDL": 0.50,
      "FULL_INS": 0.50,
      "VAS_LABEL": 0.10,
      "VAS_POLY": 0.25,
      "VAS_KIT": 30.00
    },
    "discountableCategories": ["Receiving","Storage","Fulfillment","VAS","CS"]
    // Small-scale usage note: single-admin fallback acceptable for <10 users.
  }
}
Rules:

Discounts apply only to categories in discountableCategories.

Floors evaluated per service line after discount. Any violation → clamp discount; if still violated, Export Block + Approval.

6.6 Audit Event
Collection: audit_events/{id}

json
Copy code
{
  "type": "discount_override", // rate_card_published|service_updated|tier_override|discount_override|export_generated|approval|rate_missing_fallback
  "entity": {
    "kind": "quote", // quote|rate_card|settings
    "id": "xyz123"
  },
  "userId": "uid_123",
  "payload": {
    "oldValue": 15,
    "newValue": 18,
    "reason": "VP approval due to strategic account"
  },
  "createdAt": "2025-09-25T00:00:00Z"
}
Indices: type, entity.kind+entity.id, userId, createdAt.

6.7 Calculation Contract (line generation rules)
The calc-engine (shared package) must adhere to deterministic rules:

Receiving

text
Copy code
if (mode==='unit')   subtotal = round2(units * rate)
if (mode==='carton') subtotal = round2(cartons * rate)
if (mode==='pallet') subtotal = round2(pallets * rate)
Storage

text
Copy code
subtotal = (smallBins * rateSmall + mediumBins * rateMed + largeBins * rateLarge
            + shelves * rateShelf + pallets * ratePallet) rounded 2dp
Fulfillment

text
Copy code
subtotal = (orders * unitsPerOrder * rateFirst) 
         + (orders * max(unitsPerOrder-1,0) * rateAddl)
         + (insurance ? orders * 0.50 : 0)
VAS (Labeling, Polybag, QC, Returns, Disposal, Kitting, Cycle Count, Photo, Custom)

text
Copy code
subtotal = Σ(qty * rate) per service
CS Packages

text
Copy code
subtotal = rate by package (Launch|Scale|Prime)
Surcharge/Admin
Always applied at flat values; not discountable.

Discount Application

text
Copy code
discountAmount = round2(discountableSubtotal * discountPercent)
Grand Total

text
Copy code
grandTotal = Σ(all buckets) - discountAmount