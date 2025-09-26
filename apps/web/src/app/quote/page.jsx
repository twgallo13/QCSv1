"use client";
import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export default function QuotePage() {
  const [form, setForm] = useState({
    monthlyOrders: 1000,
    averageOrderValue: 75, // dollars (UI) → convert to cents
    averageUnitsPerOrder: 3,
    sizeMixS: 40,
    sizeMixM: 40,
    sizeMixL: 20,
    rateCardId: "rc-launch"
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  async function onPreview(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // dollars → cents
      const averageOrderValueCents = Math.round((form.averageOrderValue || 0) * 100);

      const payload = {
        rateCardId: form.rateCardId,
        scopeInput: {
          monthlyOrders: form.monthlyOrders,
          averageOrderValueCents,
          averageUnitsPerOrder: form.averageUnitsPerOrder,
          shippingSizeMix: [
            { size: "S", pct: form.sizeMixS },
            { size: "M", pct: form.sizeMixM },
            { size: "L", pct: form.sizeMixL }
          ]
        }
      };

      const res = await fetch(`${API_BASE}/quotes/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Preview failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveQuote() {
    setSaving(true);
    setError("");

    try {
      // dollars → cents
      const averageOrderValueCents = Math.round((form.averageOrderValue || 0) * 100);

      const payload = {
        rateCardId: form.rateCardId,
        preview: result // Use the current preview result
      };

      const res = await fetch(`${API_BASE}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      const data = await res.json();
      
      // Navigate to the saved quote
      window.location.href = `/quotes/${data.data.id}`;
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif", maxWidth: 720, margin: "0 auto" }}>
      <h1>QCSv1 – Quote Preview</h1>
      <p>API: <code>{API_BASE}</code></p>

      <form onSubmit={onPreview} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label>
          Monthly Orders
          <input name="monthlyOrders" type="number" value={form.monthlyOrders} onChange={onChange} />
        </label>

        <label>
          Average Order Value (USD)
          <input name="averageOrderValue" type="number" step="0.01" value={form.averageOrderValue} onChange={onChange} />
        </label>

        <label>
          Avg Units Per Order
          <input name="averageUnitsPerOrder" type="number" value={form.averageUnitsPerOrder} onChange={onChange} />
        </label>

        <fieldset style={{ border: "1px solid #ddd", padding: 12 }}>
          <legend>Shipping Size Mix (%)</legend>
          <label>Small (S) <input name="sizeMixS" type="number" value={form.sizeMixS} onChange={onChange} /></label>
          <label style={{ marginLeft: 12 }}>Medium (M) <input name="sizeMixM" type="number" value={form.sizeMixM} onChange={onChange} /></label>
          <label style={{ marginLeft: 12 }}>Large (L) <input name="sizeMixL" type="number" value={form.sizeMixL} onChange={onChange} /></label>
        </fieldset>

        <label>
          Rate Card
          <select name="rateCardId" value={form.rateCardId} onChange={(e)=>setForm(f=>({...f, rateCardId: e.target.value}))}>
            <option value="rc-launch">Launch</option>
            <option value="rc-scale">Scale</option>
          </select>
        </label>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
            {loading ? "Calculating…" : "Preview Quote"}
          </button>
          {result && (
            <button 
              type="button" 
              onClick={onSaveQuote} 
              disabled={saving} 
              style={{ padding: "8px 14px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
            >
              {saving ? "Saving…" : "Save Quote"}
            </button>
          )}
        </div>
      </form>

      {error && <p style={{ color: "crimson", marginTop: 12 }}>Error: {error}</p>}

      {result && (
        <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
          <h2>Totals (cents)</h2>
          <pre style={{ background: "#fafafa", padding: 12 }}>
{JSON.stringify(result.totalsCents, null, 2)}
          </pre>
          {result.normalization?.mixAutoNormalized && <p>Mix was auto-normalized.</p>}
        </div>
      )}
    </div>
  );
}
