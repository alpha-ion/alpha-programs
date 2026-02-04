import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/qr-core', '@repo/qr-types', '@repo/ui'],
};

export default nextConfig;
