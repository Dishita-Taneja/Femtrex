/** @type {import('next').NextConfig} */
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const nextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  },
  // Proxy every /api/* request to the FastAPI backend running on port 8000.
  // This means frontend code can call fetch("/api/schemes/match") without any
  // hard-coded backend URL or CORS headers.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`
      }
    ];
  }
};

export default nextConfig;

