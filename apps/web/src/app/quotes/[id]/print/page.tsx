"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

function dollars(c:number){ return (c/100).toLocaleString(undefined,{style:"currency",currency:"USD"}); }

export default function QuotePrint(){
  const { id } = useParams() as { id: string };
  const [data,setData] = useState<any>(null);
  const [err,setErr] = useState("");

  useEffect(()=>{(async()=>{
    try{
      // use /api proxy so it works in Codespaces
      const r = await fetch(`/api/quotes/${id}`);
      if(!r.ok) throw new Error(`Fetch failed (${r.status})`);
      setData(await r.json());
    }catch(e:any){ setErr(e.message||"Failed"); }
  })()},[id]);

  useEffect(()=>{
    // auto-open print once loaded
    if (data) setTimeout(()=>window.print(), 300);
  },[data]);

  if(err) return <div style={{padding:24,color:"crimson"}}>Error: {err}</div>;
  if(!data) return <div style={{padding:24}}>Loading…</div>;

  const totals = data?.data?.totalsCents || data?.totalsCents || {};
  return (
    <div style={{ padding: 24, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @media print {
          a, button { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        h1 { margin: 0 0 6px 0; }
        .meta { color: #555; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td { border-bottom: 1px solid #eee; padding: 8px 10px; }
        tr.total td { font-weight: 700; background: #fafafa; }
      `}</style>

      <h1>Quote #{id}</h1>
      <div className="meta">
        Rate Card: {data?.data?.rateCardId || data?.rateCardId || "—"} · Created: {new Date(data?.data?.createdAt || data?.createdAt || Date.now()).toLocaleString()}
      </div>

      <table>
        <tbody>
          {Object.entries(totals).map(([k,v])=>(
            <tr key={k} className={k==='grandTotal' ? 'total' : ''}>
              <td>{k}</td>
              <td style={{textAlign:'right'}}>{dollars(v as number)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:16}}>
        <a href={`/quotes/${id}`}>&larr; Back to quote</a>
      </div>
    </div>
  );
}
