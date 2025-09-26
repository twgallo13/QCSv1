"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function QuotesList(){
  const [items,setItems] = useState<any[]>([]);
  const [err,setErr] = useState("");

  useEffect(()=>{(async()=>{
    try{
      const r = await fetch(`${API_BASE}/quotes`);
      if(!r.ok) throw new Error(`Fetch failed (${r.status})`);
      const data = await r.json();
      const list = Array.isArray(data) ? data : (data?.items || []);
      setItems(list);
    }catch(e:any){ setErr(e.message||"Failed"); }
  })()},[]);

  if(err) return <div style={{padding:24,color:"crimson"}}>Error: {err}</div>;

  return (
    <div style={{padding:24, maxWidth:900, margin:"0 auto"}}>
      <h1>Saved Quotes</h1>
      {items.length===0 ? <p>No quotes saved yet.</p> :
        <ul>
          {items.map((q:any)=>(
            <li key={q.id}><a href={`/quotes/${q.id}`}>Quote #{q.id}</a></li>
          ))}
        </ul>
      }
    </div>
  );
}
