import { NextRequest } from "next/server";

// Base origin for the backend Nest API. We prefer not to expose :4000 externally.
// In Codespaces or local dev, this will still resolve; override via NEXT_PUBLIC_API_BASE if needed.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Context = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Context) { 
  const params = await ctx.params;
  return proxy(req, params); 
}
export async function POST(req: NextRequest, ctx: Context) { 
  const params = await ctx.params;
  return proxy(req, params); 
}
export async function PUT(req: NextRequest, ctx: Context) { 
  const params = await ctx.params;
  return proxy(req, params); 
}
export async function PATCH(req: NextRequest, ctx: Context) { 
  const params = await ctx.params;
  return proxy(req, params); 
}
export async function DELETE(req: NextRequest, ctx: Context) { 
  const params = await ctx.params;
  return proxy(req, params); 
}

async function proxy(req: NextRequest, { path }: { path: string[] }) {
  const dest = `${API_BASE}/${path.join("/")}${req.nextUrl.search || ""}`;

  const headers = new Headers(req.headers);
  headers.set("host", new URL(API_BASE).host);

  const init: RequestInit = {
    method: req.method,
    headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.text(),
  };

  try {
    const r = await fetch(dest, init);
    const resHeaders = new Headers(r.headers);
    // Remove hop-by-hop / encoding headers that can cause issues when piping through
    resHeaders.delete("transfer-encoding");
    resHeaders.delete("content-encoding");
    return new Response(r.body, { status: r.status, headers: resHeaders });
  } catch (e: unknown) {
    return new Response(`Proxy error to ${dest}: ${(e as Error)?.message || "failed"}`, { status: 502 });
  }
}
