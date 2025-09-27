"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

function dollars(c:number){ return (c/100).toLocaleString(undefined,{style:"currency",currency:"USD"}); }

export default function QuoteDetail(){
  const { id } = useParams() as { id: string };
  const [data,setData] = useState<any>(null);
  const [err,setErr] = useState("");

  useEffect(()=>{(async()=>{
    try{
      const r = await fetch(`/api/quotes/${id}`);
      if(!r.ok) throw new Error(`Fetch failed (${r.status})`);
      setData(await r.json());
    }catch(e:any){ setErr(e.message||"Failed"); }
  })()},[id]);

  if(err) return <div style={{padding:24,color:"crimson"}}>Error: {err}</div>;
  if(!data) return <div style={{padding:24}}>Loading…</div>;

  const totals = data?.data?.totalsCents || data?.totalsCents || {};
  return (
    <div style={{padding:24, maxWidth:900, margin:"0 auto"}}>
      <h1>Quote #{id}</h1>
      <p>Rate Card: {data?.data?.rateCardId || data?.rateCardId || "—"}</p>
      <h3>Totals</h3>
      <table style={{width:"100%", borderCollapse:"collapse"}}>
        <tbody>
          {Object.entries(totals).map(([k,v])=>(
            <tr key={k}>
              <td style={{borderBottom:"1px solid #eee", padding:"8px 10px"}}>{k}</td>
              <td style={{borderBottom:"1px solid #eee", padding:"8px 10px", textAlign:"right"}}>{dollars(v as number)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{marginTop:16}}><a href="/quotes">← All quotes</a></p>
    </div>
  );
}
