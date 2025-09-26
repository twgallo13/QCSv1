async function getQuote(id) {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";
  const res = await fetch(`${base}/quotes/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function QuoteDetail({ params }) {
  const data = await getQuote(params.id);
  if (!data) return <div style={{padding:24}}><h1>Quote not found</h1></div>;
  
  const toUSD = (c=0)=> (c/100).toLocaleString(undefined,{style:"currency",currency:"USD"});
  const t = data.data.totals || {};
  
  return (
    <div style={{padding:24,fontFamily:"Inter,system-ui,sans-serif"}}>
      <h1>Quote #{data.data.id}</h1>
      <p>Rate Card: {data.data.rateCardId} (v{data.data.rateCardVersion})</p>
      <p>Created: {new Date(data.data.createdAt).toLocaleString()}</p>
      
      <h2>Totals</h2>
      <ul>
        <li>Storage: {toUSD(t.Storage)}</li>
        <li>Fulfillment: {toUSD(t.Fulfillment)}</li>
        <li>Labor: {toUSD(t.Labor)}</li>
        <li>CS: {toUSD(t.CS)}</li>
        <li>Surcharges: {toUSD(t.Surcharges)}</li>
        <li>Admin: {toUSD(t.Admin)}</li>
        <li><strong>Grand Total: {toUSD(t.grandTotal)}</strong></li>
      </ul>
      
      <h3>Raw Data</h3>
      <pre style={{background:"#fafafa",padding:12}}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
