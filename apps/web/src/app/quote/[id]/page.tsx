import Link from 'next/link';

// format cents -> $X,XXX.XX
function dollars(cents: number | undefined) {
  if (typeof cents !== "number" || Number.isNaN(cents)) return "—";
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default async function QuoteDetail({ params }: { params: { id: string } }) {
  const id = params.id;
  
  try {
    const res = await fetch(`http://localhost:3001/api/quotes/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return (
        <div className="p-6">
          <h1 className="text-xl font-semibold">Quote not found</h1>
          <Link href="/quote" className="underline">Back to builder</Link>
        </div>
      );
    }
    
    const data = await res.json();
    const quote = data?.data || data;
    const totals = quote?.totalsCents || {};
    
    return (
      <div className="p-6 space-y-4" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quote #{id}</h1>
          <Link href="/quote" className="underline">New quote</Link>
        </div>
        
        <div className="text-sm text-gray-600">
          Rate Card: {quote?.rateCardId || "—"} · Created: {new Date(quote?.createdAt || Date.now()).toLocaleString()}
        </div>
        
        <div style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(totals).map(([k,v])=>(
                <tr key={k} style={{ background: k==='grandTotal' ? "#fafafa" : "white" }}>
                  <td style={{ borderBottom:"1px solid #eee", padding:"10px 12px", fontWeight: k==='grandTotal' ? 700 : 400 }}>
                    {k}
                  </td>
                  <td style={{ borderBottom:"1px solid #eee", padding:"10px 12px", textAlign:"right", fontWeight: k==='grandTotal' ? 700 : 400 }}>
                    {dollars(v as number)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Error loading quote</h1>
        <p className="text-red-600">Failed to load quote #{id}</p>
        <Link href="/quote" className="underline">Back to builder</Link>
      </div>
    );
  }
}
