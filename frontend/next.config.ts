import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/resume",
        destination: "/careers",
        permanent: true,
      },
      {
        source: "/send-resume",
        destination: "/careers",
        permanent: true,
      },
      {
        source: "/partner/internet",
        destination: "/internet",
        permanent: false,
      },
      {
        source: "/partner/static-ip",
        destination: "/internet",
        permanent: false,
      },
      {
        source: "/partner/catalog",
        destination: "/partner",
        permanent: false,
      },
      {
        source: "/partner/agents",
        destination: "/partner",
        permanent: false,
      },
      {
        source: "/dashboard/partner-internet",
        destination: "/internet",
        permanent: false,
      },
      {
        source: "/dashboard/partner-static-ip",
        destination: "/internet",
        permanent: false,
      },
      {
        source: "/dashboard/partner-catalog",
        destination: "/partner",
        permanent: false,
      },
      {
        source: "/dashboard/partner-agents",
        destination: "/partner",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const rawBackendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.INTERNAL_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      (process.env.NODE_ENV === "production" ? "http://backend:3001" : "http://localhost:3001");
    const backendUrl = rawBackendUrl.replace(/\/+$/, "");
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;

