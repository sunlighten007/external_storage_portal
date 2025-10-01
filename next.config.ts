import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true
  },
  // Disable problematic features for Vercel deployment
  trailingSlash: true,
  // Disable problematic features for Vercel
  images: {
    unoptimized: true
  }
};

export default nextConfig;
