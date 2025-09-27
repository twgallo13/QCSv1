import type { NextConfig } from "next";

// Development proxy so that requests to /api/* from the web app go to the Nest API (port 4000)
// This lets the frontend call relative paths ("/api/health") without hard‑coding the backend origin
const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy everything under /api to the backend API. Adjust if you later add Next API routes.
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/:path*",
      },
    ];
  },
};

export default nextConfig;
