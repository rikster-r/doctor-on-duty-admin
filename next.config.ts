import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  optimizePackageImports: ['@phosphor-icons/react'],
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
};

export default nextConfig;
