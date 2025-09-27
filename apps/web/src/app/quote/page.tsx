"use client";
import { useState } from "react";


type Mix = { size: "S" | "M" | "L"; pct: number };

export default function QuotePage() {
  const [monthlyOrders, setMonthlyOrders] = useState(500);
  const [aov, setAov] = useState(10000);
  const [units, setUnits] = useState(1);
  const [mix, setMix] = useState<Mix[]>([
    { size: "S", pct: 60 },
    { size: "M", pct: 30 },
    { size: "L", pct: 10 },
  ]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [totals, setTotals] = useState<any>(null);

  const updateMix = (i: number, val: number) => {
    const copy = [...mix];
    copy[i] = { ...copy[i], pct: val };
    setMix(copy);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setTotals(null); setLoading(true);
    try {
      const res = await fetch(`/api/quotes/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rateCardId: "rc-launch",
          scopeInput: {
            monthlyOrders: Number(monthlyOrders),
            averageOrderValueCents: Number(aov),
            averageUnitsPerOrder: Number(units),
            shippingSizeMix: mix,
          },
        }),
      });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      const data = await res.json();
      setTotals(data.totalsCents || data);
    } catch (e: any) {
      setErr(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: "0 auto", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1>Quote Preview</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(3, 1fr)", marginTop: 12 }}>
        <label>Monthly Orders
          <input type="number" value={monthlyOrders} onChange={e=>setMonthlyOrders(+e.target.value)} min={0} />
        </label>
        <label>AOV (cents)
          <input type="number" value={aov} onChange={e=>setAov(+e.target.value)} min={0} />
        </label>
        <label>Units / Order
          <input type="number" value={units} onChange={e=>setUnits(+e.target.value)} min={1} />
        </label>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12 }}>
          {mix.map((m, i)=>(
            <label key={m.size} style={{ display: "flex", flexDirection: "column" }}>
              {m.size} %
              <input type="number" value={m.pct} min={0} max={100}
                     onChange={e=>updateMix(i, +e.target.value)} />
            </label>
          ))}
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Calculating…" : "Preview"}
          </button>
          {err && <span style={{ color: "crimson", marginLeft: 12 }}>Error: {err}</span>}
        </div>
      </form>

      {totals && (
        <table style={{ marginTop: 18, width: "100%", borderCollapse: "collapse" }}>
          <tbody>
          {Object.entries(totals).map(([k,v])=>(
            <tr key={k}>
              <td style={{ borderBottom:"1px solid #eee", padding:"6px 8px" }}>{k}</td>
              <td style={{ borderBottom:"1px solid #eee", padding:"6px 8px", textAlign:"right" }}>{v as number}</td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
