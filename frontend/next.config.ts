import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
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
    ];
  },
};

export default nextConfig;

