"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toCents, toMajor } from "qcsv1-schema";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Mix = { size: "S" | "M" | "L"; pct: number };
type Totals = Record<string, number> | null;

export default function QuotePage() {
  const router = useRouter();
  const [monthlyOrders, setMonthlyOrders] = useState<number>(500);
  const [aovDollars, setAovDollars] = useState<number>(100.00); // UI shows dollars
  const [units, setUnits] = useState<number>(1);
  const [mix, setMix] = useState<Mix[]>([
    { size: "S", pct: 60 },
    { size: "M", pct: 30 },
    { size: "L", pct: 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [totals, setTotals] = useState<Totals>(null);

  const mixSum = useMemo(() => mix.reduce((s, m) => s + (m.pct || 0), 0), [mix]);
  const isMixValid = Math.round(mixSum) === 100;
  const formErrors = useMemo(() => {
    const issues: string[] = [];
    if (monthlyOrders < 0) issues.push("Monthly orders must be 0 or more.");
    if (aovDollars < 0) issues.push("AOV must be 0 or more.");
    if (units < 1) issues.push("Units per order must be at least 1.");
    if (!isMixValid) issues.push("Shipping mix must total 100%.");
    return issues;
  }, [monthlyOrders, aovDollars, units, isMixValid]);

  const updateMix = (i: number, val: number) => {
    const v = Number.isFinite(val) ? Math.max(0, Math.min(100, val)) : 0;
    const copy = [...mix];
    copy[i] = { ...copy[i], pct: v };
    setMix(copy);
  };

  const requestBody = {
    rateCardId: "rc-launch",
    scopeInput: {
      monthlyOrders: Number(monthlyOrders),
      averageOrderValueCents: toCents(aovDollars),
      averageUnitsPerOrder: Number(units),
      shippingSizeMix: mix,
    },
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setTotals(null);
    if (formErrors.length) return; // block submit if invalid
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Preview failed (${res.status}) ${txt}`.trim());
      }
      const data = await res.json();
      setTotals(data.totalsCents || data);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    try {
      setSaving(true);
      const res = await fetch(`/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = await res.json(); // expect { id, ... }
      if (data?.id) router.push(`/quote/${data.id}`);
    } catch (e: any) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ margin: 0 }}>Quote Preview</h1>
      <p style={{ marginTop: 6, color: "#555" }}>Enter assumptions and preview your monthly cost breakdown.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 16 }}>
        <label>Monthly Orders
          <input type="number" value={monthlyOrders} onChange={e=>setMonthlyOrders(+e.target.value)} min={0} />
        </label>
        <label>AOV ($)
          <input type="number" value={aovDollars} onChange={e=>setAovDollars(+e.target.value)} min={0} step="0.01" />
        </label>
        <label>Units / Order
          <input type="number" value={units} onChange={e=>setUnits(+e.target.value)} min={1} />
        </label>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "flex-end" }}>
          {mix.map((m, i)=>(
            <label key={m.size} style={{ display: "flex", flexDirection: "column" }}>
              {m.size} %
              <input type="number" value={m.pct} min={0} max={100}
                     onChange={e=>updateMix(i, +e.target.value)} />
            </label>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 13, color: isMixValid ? "#0a0" : "#b00" }}>
            Mix total: {mixSum}%
          </div>
        </div>

        {formErrors.length > 0 && (
          <div style={{ gridColumn: "1 / -1", background: "#fff3f3", border: "1px solid #f3caca", padding: 10, borderRadius: 8, color: "#900" }}>
            <strong>Fix these before preview:</strong>
            <ul style={{ margin: "6px 0 0 18px" }}>
              {formErrors.map((m, idx)=><li key={idx}>{m}</li>)}
            </ul>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading || formErrors.length>0} style={{ padding: "8px 14px" }}>
            {loading ? "Calculating…" : "Preview"}
          </button>
          {err && <span style={{ color: "crimson", marginLeft: 12 }}>Error: {err}</span>}
        </div>
      </form>

      {totals && (
        <div style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
            {Object.entries(totals).map(([k,v])=>(
              <tr key={k} style={{ background: k==='grandTotal' ? "#fafafa" : "white" }}>
                <td style={{ borderBottom:"1px solid #eee", padding:"10px 12px", fontWeight: k==='grandTotal' ? 700 : 400 }}>
                  {k}
                </td>
                <td style={{ borderBottom:"1px solid #eee", padding:"10px 12px", textAlign:"right", fontWeight: k==='grandTotal' ? 700 : 400 }}>
                  {toMajor(v as number)}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          <div style={{ padding: "12px", background: "#f8f9fa", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button 
              onClick={onSave} 
              disabled={saving}
              aria-busy={saving}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: saving ? "#6c757d" : "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? 'Saving…' : 'Save Quote'}
            </button>
            <a href="/quotes" style={{ fontSize: "14px", color: "#666" }}>View all quotes</a>
          </div>
        </div>
      )}
    </div>
  );
}
