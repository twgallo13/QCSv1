QCSv1 — Core Workflows & Escalation Paths
=========================================

## 3.1 Workflow: Quote Creation
**Actors:** admin  
**Entry Point:** Dashboard → Quotes → New Quote  

**Steps:**
1. **Select Rate Card Type**  
   - Options: Tiered | Flat | Harmonized  
   - Required field.  
   - Schema: `quote.meta.rate_card_type`  

2. **Enter Required Inputs**  
   - Tiered/Flat: `monthly_orders` (int ≥ 0).  
   - Harmonized: `monthly_orders` + `target_monthly_spend`.  
   - Optional: GMV, bins/shelves/pallets, units per order, insurance flag, VAS usage, CS package.  
   - Schema: `quote.inputs`  

3. **Auto Tier Resolution (if Tiered)**  
   - **Tier Resolution (deterministic):**  
     - Metric precedence: orders → GMV → bins.  
     - Bounds are inclusive (null = open-ended).  
     - If multiple tiers match, choose highest rank.  
     - If none match, default to **Scale**; audit `tier_resolved="fallback"`.  

4. **Subtotal Calculations (4-Pillar)**  
   - Storage Total = Σ(storage lines).  
   - Fulfillment Total = Σ(order lines + insurance).  
   - Labor Total = Σ(VAS + custom labor).  
   - CS Total = selected package.  
   - Schema: `quote.lines[].bucket`.  

5. **Discount Handling**  
   - If Harmonized: compute discount = (new_total - target)/new_total.  
   - Clamp at MAX_DISCOUNT.  
   - Apply only to discountable services (exclude surcharges/admin).  
   - Schema: `quote.discount_percent`.  

6. **Summary View**  
   - Show line items + 4 pillars + Monthly Total.  
   - Badges: Included | Optional | Add-on.  
   - Action: Save Draft / Export.  

**Fallbacks:**  
- If optional inputs = 0 → totals default to minimal baseline.  
- If no tier resolved → default to Scale; audit event logged.  

---

## 3.2 Workflow: Rate Card Management
**Actors:** admin  
**Entry Point:** Dashboard → Rate Cards  

**Steps:**
1. **Create Draft Card**  
   - Enter name, version label.  
   - Status = draft.  

2. **Add Tiers**  
   - Default: Launch / Scale / Prime.  
   - Add/remove via Add Tier / Remove Tier.  
   - Tier rules: orders, GMV, bins min/max.  
   - Guard: Overlapping ranges not allowed.  

3. **Add Services**  
   - From catalog or custom.  
   - Set: code, name, category, pricing_type, unit, visibility, discountable.  

4. **Set Prices**  
   - Matrix editor → rates per tier or global.  
   - Guard: Floors validated.  

5. **Publish**  
   - Draft → Active.  
   - Archive old versions (read-only).  
   - Schema: `rate_card.status`.  

---

## 3.3 Workflow: Harmonization (Client Loyalty Discount)
**Actors:** admin  
**Entry Point:** Quote → Harmonize  

**Steps:**
1. **Enter Target Spend** (required).  
2. **System calculates New Price** (based on inputs + rate card).  
3. **Delta shown** (+/– $).  
4. **Discount % calculated**  
   ```text
   loyalty_discount = clamp((new_price - target) / new_price, 0, MAX_DISCOUNT)
Apply discount → harmonized total matches target.

Save → discount embedded in quote; audit event recorded.

Guardrail:

If legacy spend = 0 or inactive ≥ 6 months, Harmonized OFF by default. Admin may enable per-quote with mandatory approval note.

3.4 Workflow: Competitor Comparison (Optional)
Actors: admin
Entry Point: Quote → Competitor Tab

Steps:

Enter competitor rates (flat numbers or monthly total).

System computes delta vs Collab3PL quote.

Display comparison card (internal only).

Option to export internal-only report.

Schema: competitor_rate_set

Fallback:

If competitor data incomplete → show partial delta with warnings.

3.5 Escalation Logic (Global)
Tier Override Downward

Trigger: Resolved tier is overridden to a lower tier.

Action: Require justification text; show margin impact.

Outcome: Approval required if margin drops below threshold; audit tier_override.

Discount & Floors Order:

Round lines → sum buckets → compute discountable subtotal → apply discount (clamp to MAX_DISCOUNT) → verify per-service floors.

If any violated, auto-reduce discount to first valid value.

If still violated, Block Export + Approval.

Approval Roles (two-person rule)

Rule: The requesting admin cannot approve their own override. Another admin must approve.

Single-Admin fallback: If only one admin exists, allow self-approval with mandatory reason and banner “Single-approver fallback” in Audit.

3.6 Traceability Map
Workflow	UI Elements	Schema	Escalations
Quote Creation	Tabs, inputs, toggles	quote, quote_line, rate_card	Tier override, discount, floor
Rate Card Mgmt	Matrix editor, tiers	rate_card, rate_card_tier, service, rate_card_price	Range overlap
Harmonization	Target spend input	quote.discount_percent, audit_event	Discount > MAX
Competitor	Competitor tab	competitor_rate_set	Incomplete data
Escalations	Modals	audit_event	Logged per case

3.7 Sample Test Vectors
Valid

Orders=1,200; Tiered; system resolves Scale → total $8,875.

Harmonized; Target=$8,500; discount=4.23% → harmonized total $8,500.

Competitor monthly total=$9,200 → Delta +$700 in favor of Collab.

Invalid

Harmonized without Target Spend → Error: “Target Spend required.”

Overlapping tiers in Rate Card → Error: “Tier ranges overlap.”

Pick fee < floor → Error until override logged.

Edge

Target < New by >20% → discount = 20% (capped at MAX_DISCOUNT=15%); export blocked until override.

Target > New → discount = 0; system marks “Value Win.”

Orders=0 but Target=$5,000 → warn “No order volume entered; totals may be inaccurate.”

3.8 Open Issues & Assumptions (Section 3)
MAX_DISCOUNT default assumed at 15%. Confirm threshold.

Approval roles: Single-role admin → in this version, admin may self-approve (audit only).

Competitor module: Kept as optional; can be hidden in Settings if not wanted.

Storage defaults: If bins/shelves omitted, assume 0; should we instead use “average bins per order” heuristic?

Labor floors: Assumed only for kitting/hourly. Do you want explicit floors for Labeling/Polybag too?

yaml
Copy code

