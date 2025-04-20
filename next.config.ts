import type { NextConfig } from 'next';

// Add webpack fallbacks for Node core modules to prevent client-side bundling errors
const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
