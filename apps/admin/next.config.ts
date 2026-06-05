import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  transpilePackages: [
    "@beeplay/constants",
    "@beeplay/types",
    "@beeplay/utils",
  ],
};

export default nextConfig;
