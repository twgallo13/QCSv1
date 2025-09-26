"use client";
import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";
const toUSD = (c=0)=> (c/100).toLocaleString(undefined,{style:"currency",currency:"USD"});

export default function QuoteDetail({ params }) {
  const [data, setData] = useState(null);
  const [latestRateCard, setLatestRateCard] = useState(null);
  const [newerPreview, setNewerPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch quote data
        const quoteRes = await fetch(`${API_BASE}/quotes/${params.id}`, { cache: "no-store" });
        if (!quoteRes.ok) throw new Error("Quote not found");
        const quoteData = await quoteRes.json();
        setData(quoteData);

        // Fetch latest rate card
        const latestRes = await fetch(`${API_BASE}/ratecards/latest`);
        if (latestRes.ok) {
          const latestData = await latestRes.json();
          setLatestRateCard(latestData.item);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  async function handlePreviewNewer() {
    setPreviewLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_BASE}/quotes/${params.id}/preview-newer`);
      if (!res.ok) throw new Error("Preview failed");
      const previewData = await res.json();
      setNewerPreview(previewData);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  }

  if (loading) return <div style={{padding:24}}>Loading...</div>;
  if (error) return <div style={{padding:24}}><h1>Error: {error}</h1></div>;
  if (!data) return <div style={{padding:24}}><h1>Quote not found</h1></div>;

  const t = data.data.totals || {};
  const showBanner = latestRateCard && latestRateCard.id !== data.data.rateCardId;

  return (
    <div style={{padding:24,fontFamily:"Inter,system-ui,sans-serif"}}>
      <h1>Quote #{data.data.id}</h1>
      <p>Rate Card: {data.data.rateCardId} (v{data.data.rateCardVersion})</p>
      <p>Created: {new Date(data.data.createdAt).toLocaleString()}</p>
      
      {showBanner && (
        <div style={{
          background: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "4px",
          padding: "12px",
          margin: "16px 0"
        }}>
          <p><strong>Newer rate card available:</strong> {latestRateCard.name} (v{latestRateCard.version})</p>
          <button 
            onClick={handlePreviewNewer}
            disabled={previewLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {previewLoading ? "Loading..." : "Preview with Newer Rates"}
          </button>
        </div>
      )}

      {error && <p style={{color: "crimson"}}>Error: {error}</p>}

      <h2>Totals</h2>
      {newerPreview ? (
        <table style={{borderCollapse: "collapse", width: "100%", marginBottom: "20px"}}>
          <thead>
            <tr style={{backgroundColor: "#f8f9fa"}}>
              <th style={{border: "1px solid #ddd", padding: "8px", textAlign: "left"}}>Category</th>
              <th style={{border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>Saved</th>
              <th style={{border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>Newer</th>
              <th style={{border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>Diff</th>
            </tr>
          </thead>
          <tbody>
            {['Storage', 'Fulfillment', 'Labor', 'CS', 'Surcharges', 'Admin', 'grandTotal'].map(category => {
              const saved = t[category] || 0;
              const newer = newerPreview.totalsCents[category] || 0;
              const diff = newer - saved;
              const isTotal = category === 'grandTotal';
              
              return (
                <tr key={category} style={isTotal ? {fontWeight: "bold", backgroundColor: "#f8f9fa"} : {}}>
                  <td style={{border: "1px solid #ddd", padding: "8px"}}>
                    {isTotal ? "Grand Total" : category}
                  </td>
                  <td style={{border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>
                    {toUSD(saved)}
                  </td>
                  <td style={{border: "1px solid #ddd", padding: "8px", textAlign: "right"}}>
                    {toUSD(newer)}
                  </td>
                  <td style={{
                    border: "1px solid #ddd", 
                    padding: "8px", 
                    textAlign: "right",
                    color: diff > 0 ? "#dc3545" : diff < 0 ? "#28a745" : "inherit"
                  }}>
                    {diff > 0 ? "+" : ""}{toUSD(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <ul>
          <li>Storage: {toUSD(t.Storage)}</li>
          <li>Fulfillment: {toUSD(t.Fulfillment)}</li>
          <li>Labor: {toUSD(t.Labor)}</li>
          <li>CS: {toUSD(t.CS)}</li>
          <li>Surcharges: {toUSD(t.Surcharges)}</li>
          <li>Admin: {toUSD(t.Admin)}</li>
          <li><strong>Grand Total: {toUSD(t.grandTotal)}</strong></li>
        </ul>
      )}
      
      <h3>Raw Data</h3>
      <pre style={{background:"#fafafa",padding:12}}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
