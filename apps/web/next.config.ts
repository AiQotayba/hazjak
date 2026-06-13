import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/stadium-owner", destination: "/owner", permanent: true },
      { source: "/stadium-owner/:path*", destination: "/owner/:path*", permanent: true },
      { source: "/stadium/:slug", destination: "/stadiums/:slug", permanent: true },
      { source: "/owner/analytics", destination: "/owner", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/uploads/**" },
    ],
  },
  transpilePackages: [
    "@hazjak/constants",
    "@hazjak/types",
    "@hazjak/utils",
    "@hazjak/validation",
  ],
};

export default nextConfig;
