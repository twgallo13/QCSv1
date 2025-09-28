QCSv1 — UI Navigation & Dashboard
=================================

## 4.1 Global Navigation (Top Bar)

**Visible to:** admin (only role)  

**Primary Menu (left to right):**
1. **Logo / Org Name** (from Settings → Branding)  
2. **Dashboard**  
3. **Quotes**  
4. **Rate Cards**  
5. **Settings**  
6. **Audit**  

**Right Side Controls:**
- **Quick Actions:** + New Quote, + New Rate Card  
- **Profile Menu:** {Admin Email} → Sign out  
- **Environment Badge (optional):** DEV | STAGING | PROD  

**Keyboard Shortcuts (optional):**
- `Q` → New Quote modal  
- `R` → New Rate Card  
- `/` → Global search (quotes, cards by name/code)  
- `Cmd/Ctrl + K` → Command palette (jump to screens)  

**Route Guards (Firebase Auth):**
- Unauthed → redirect to `/login`  
- Authed, role !== admin → hard stop (in this version, single role; future-proofed)  

---

## 4.2 Dashboard

**Path:** `/`  
**Purpose:** High-level snapshot + shortcuts.  

**Cards (2 columns):**
- **Recent Quotes** (table, last 10; cols: Quote Name, Card Type, Resolved Tier, Status, Updated At)  
- **Active Rate Cards** (list; Name, Version Label, Status)  
- **Tasks & Warnings** (pill list):  
  - “Discount > MAX on 3 drafts”  
  - “Tier ranges overlapping in ‘Master v2025Q4’”  
- **Quick Start** (buttons):  
  - + New Quote (primary)  
  - + New Rate Card (secondary)  

**Empty State:** Friendly message + big + New Quote  
**Schema touches:** quotes, rate_card  
**Workflow links:** UC-2 (Quote), UC-1 (Rate Card)  

---

## 4.3 Quotes

### 4.3.1 Quotes List
**Path:** `/quotes`  
**Controls:**  
- **Search** (by quote name, vendor_name)  
- **Filters:** Status (draft, finalized, exported), Card Type (tiered, flat, harmonized)  
- **Table Columns:** Name, Vendor, Card Type, Resolved Tier, Total (latest calc), Status, Updated At, Actions …  
- **Row Actions:** Open, Duplicate, Export, Delete  

**Empty State:** “No quotes yet” + + New Quote  
**Schema:** quotes  
**Workflows:** UC-2, UC-5  

---

### 4.3.2 New Quote Wizard
**Path:** `/quotes/new`  
**Step Header:** “Rate Card Type → Inputs → Details → Summary → Export”  

**Step A: Rate Card Type**
- Radio group: Tiered | Flat | Harmonized *(default: Tiered)*  
- Dropdown: **Select Rate Card** (defaults to latest Active)  
- Button: Continue  

**Step B: Minimal Inputs (always visible)**
- **Monthly Orders** (required; number)  
- **Target Monthly Spend** (required *only if* Harmonized; currency)  
- Button: Continue (enabled when required satisfied)  

**Inputs Schema (strict):**
- `monthlyOrders: number ≥ 0` (required for all modes).  
- `targetMonthlySpend: currency ≥ 0` (required for Harmonized only).  
- `fulfillment.unitsPerOrder: number ≥ 1` if `monthlyOrders > 0` (auto-fix to 1 with warning).  
- `storage.*`: numbers ≥ 0; defaults **0** unless explicitly entered.  

**Step C: Detailed Inputs (accordion with sticky 4-pillar preview)**
- **Snapshot:** GMV, Avg Storage (bins), Notes (text)  
- **Storage Defaults:** If no storage inputs are provided, system uses **0** as default (no heuristic). Admin may enable an optional “heuristic suggestion” toggle in Settings to prefill averages, but totals always calculate from explicit inputs.  
- **Receiving:** Mode radio (Unit 0.10 | Carton 20 | Pallet 30) + quantities (optional)  
- **Storage:** Toggle Bins | Shelves; inputs for S/M/L bins, Shelves, Pallets (optional)  
- **Fulfillment:** Units per Order, Insurance checkbox (+$0.50/order)  
- **VAS (Presets):** chips (Apparel, Footwear, Accessories, Beauty, Electronics) → prefill fields  
- **VAS (Quick Entry):** Labeling units, Polybag units, Photo styles; Show full catalog → QC units, Returns units, Disposal units, Kitting hours, Cycle Count requests, Custom hours  
- **CS Package:** radio Launch | Scale | Prime  
- **Sticky Preview (right rail):** Storage / Fulfillment / Labor / CS subtotals + Grand Total (live)  

**Buttons (footer):** Save Draft, Continue  

**Step D: Summary**
- **Line Items table** (category, service name, qty, unit, rate, subtotal, badge)  
- **4-Pillar Cards** with subtotals  
- **Discount Line** (for Harmonized/Custom)  
- **Grand Total**  
- Notes & disclaimers (carrier at cost; admin fees contract-only)  
- Buttons: Save Draft, Export, Finalize  

**Step E: Export**
- **Format menu:** Vendor PDF | Finance CSV | Audit JSON  
- **Options:**  
  - Vendor PDF: toggle “Itemize VAS lines” (default OFF), Branding preview (from Settings)  
  - Finance CSV: include internal lines (always ON)  
  - Audit JSON: includes formulas & events  
- **Generate** → success toast + download links  

**Modal Prompts (Escalations):**
- Tier override down → justification textarea → confirm  
- Discount > MAX → block Export until Override (records audit)  
- Floor violation → cannot proceed unless Override with reason  

**Schema:** quotes, quote_lines, generated files in Storage  
**Workflows:** UC-2, UC-3, UC-5, UC-7  

---

## 4.4 Rate Cards

### 4.4.1 Rate Cards List
**Path:** `/rate-cards`  
**Controls:** Search, Filter by Status (Active/Draft/Archived)  
**Table Columns:** Name, Version Label, Status, Services (#), Tiers (#), Updated At, Actions  
**Row Actions:** Open, Duplicate, Archive, Set Active  

**Schema:** rate_card  
**Workflows:** UC-1  

---

### 4.4.2 Rate Card Detail
**Path:** `/rate-cards/:id`  

**Tabs:**
1. **Tiers**  
   - Table: Tier Key, Name, Orders min/max, GMV min/max, Bins min/max, Rank  
   - Buttons: Add Tier, Remove, Reorder  
   - Validation: no overlaps; all bounds valid (null = open-ended)  

2. **Services**  
   - Matrix editor (rows = services; columns = pricing fields per tier or global)  
   - Columns: Code, Name, Category, Pricing Type, Unit, Visibility (Vendor/Internal/Both), Discountable (toggle)  
   - Inline price editors per tier (e.g., Launch/Scale/Prime)  
   - “Add Service” modal (new or from catalog)  

3. **Surcharges**  
   - Extended Hours ($/hr), Weekend ($/hr), Rush ($/order)  
   - Visibility notes (vendor-facing or on-request)  

4. **Notes & Visibility**  
   - Editor for vendor-facing notes; internal-only notes  

5. **Publish**  
   - Status badge: Draft | Active | Archived  
   - Buttons: Publish as Active, Archive, Duplicate  

**Schema:** rate_card, rate_card_tier, service, rate_card_price  
**Workflows:** UC-1, UC-6  

---

## 4.5 Settings

**Path:** `/settings`  

**Tabs:**
1. **Branding**  
   - Org Name (text), Logo upload (PNG/SVG), Colors (primary/accent hex)  
   - PDF header/footer preview  
   - Save  

2. **Governance**  
   - MAX_DISCOUNT% (default 15)  
   - Floor Rates table (optional) by service code (e.g., FULL_FIRST min $2.25)  
   - Discountable Categories multi-select (Receiving, Storage, Fulfillment, VAS, CS)  
   - Save  

3. **Features**  
   - Toggle: Competitor Module (on/off)  
   - Toggle: Command Palette  
   - Save  

**Schema:** settings_branding, settings_governance, settings_features  
**Workflows:** UC-4, UC-7, UC-8  

---

## 4.6 Audit

**Path:** `/audit`  
**Filters:** Date range, User, Quote ID, Type (override, approval, export, publish, service_updated)  
**Table Columns:** Timestamp, User, Type, Entity (Quote/Rate Card), Details (JSON expander)  
**Row Action:** View Context → deep link to quote/card  

**Schema:** audit_event  
**Workflow:** All UC events logged  

---

## 4.7 Common UI States & Patterns
- **Loading:** skeletons for tables, shimmer for cards  
- **Empty:** “Nothing here yet” + CTA  
- **Error (API):** banner with retry; Cloud Run errors normalized to code/message  
- **Confirmations:** destructive actions (Delete, Archive) require confirm modal  
- **Toasts:** success/info/warn/error (top-right)  
- **Help:** tooltips (i) on every numeric field with units and formula hints  

---

## 4.8 Navigation Flows (Examples)

**Flow: New Quote (Harmonized)**
1. `/quotes/new` → choose Harmonized + Card  
2. Enter Orders + Target → Continue  
3. Add VAS via preset → watch 4-pillar update  
4. Summary → shows Discount line → Export Vendor PDF  

**Flow: Update Rate Card Prices**
1. `/rate-cards` → open Active card  
2. Services tab → edit STOR_SHELF Prime from $1.00 to $1.10  
3. Save → Audit `service_updated`  
4. Quotes referencing this version recalc on open (snapshot preserved on finalized quotes)  

**Flow: Branding Update**
1. `/settings` → Branding → upload logo, set colors  
2. Save → confirm toast → PDFs re-render with new header/footer  

---

## 4.9 Traceability Matrix (UI → Schema → Workflow)

| **UI Element**        | **Schema**                | **Workflow** |
|------------------------|---------------------------|--------------|
| + New Quote            | quote                     | UC-2 |
| Rate Card Type toggle  | quote.meta.rate_card_type | UC-2 |
| Minimal Inputs         | quote.inputs              | UC-2 |
| 4-Pillar Preview       | quote_line.bucket         | UC-2 calc |
| Harmonize button       | quote.discount_percent    | UC-3 |
| Export menu            | (generated Storage files) | UC-5 |
| Tier table             | rate_card_tier            | UC-1 |
| Service matrix         | service, rate_card_price  | UC-6 |
| MAX_DISCOUNT field     | settings_governance       | UC-7 |
| Audit list             | audit_event               | Cross-UC |

---

## 4.10 Sample Test Vectors

**Valid**
1. **Create Tiered Quote with minimal inputs**  
   - Orders=1200; no storage/VAS entered.  
   - Expected: Resolved to Scale; Fulfillment subtotal > 0; other pillars possibly 0; Grand Total shows; Summary export allowed.  
2. **Harmonized Quote with VAS preset**  
   - Orders=1000; Target=$8500; Apparel preset → polybag 4000 units, labeling 6000 units.  
   - Expected: VAS contributes to Labor subtotal; Discount computed and clamped ≤ MAX_DISCOUNT; Export PDF ok.  
3. **Publish Rate Card**  
   - Create Draft, add tiers/services, set prices, Publish.  
   - Expected: Status=Active; appears in Quote wizard.  

**Invalid**
1. Harmonized without Target → error tooltip on field; Continue disabled.  
2. Overlapping tier bounds → Save blocked on Tiers tab with inline errors (orders/gmv/bins).  
3. Floor rate violation on Service matrix → cannot save until rate ≥ floor or override recorded (modal).  

**Edge**
1. Orders=0 with large VAS units → Warning banner: “No orders entered; confirm VAS usage.”  
2. Discount > MAX_DISCOUNT → Export blocked; Override requires reason; audit logged.  
3. Attempt to delete Active Rate Card → Confirm modal; if last active, block deletion (“At least one active card required”).  

---

## 4.11 Closed UI/Behavior Questions (Section 4)

1. **Auto-snapshot on Finalize:** On **Finalize**, resolved rates and branding are **snapshotted** into `quote_lines` and `quote.meta.branding` (immutable).  
2. **Recalc Policy (Drafts):** Draft quotes **recalc on open** against the **latest Active** rate card **unless** the draft is **locked** (explicit toggle on the Summary step).  
3. **Command Palette:** Feature flag in Settings → **Features** (default OFF).  
4. **Global Search Scope:** Indexes `quote.name`, `vendor_name`, `rate_card.name`, and `service.code`.  
5. **Time Zones:** All timestamps stored **UTC**; UI displays **browser local**.  
6. **Approval Roles:** Default **two-person rule**; the requesting admin cannot approve their own override. If only one admin exists, allow self-approval with mandatory reason and banner “Single-approver fallback” in Audit.  