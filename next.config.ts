import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Used by `next dev` only. Static export ignores rewrites (warning is harmless).
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:4000/api/:path*",
      },
      {
        source: "/mcp",
        destination: "http://127.0.0.1:4000/mcp",
      },
    ]
  },
}

export default nextConfig
