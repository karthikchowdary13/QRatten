import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      {
        source: '/teacher/:path*',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/teacher',
        destination: '/dashboard',
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
