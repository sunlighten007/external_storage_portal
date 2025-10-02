import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    nodeMiddleware: true
  },
  // External packages for bcryptjs Node.js compatibility
  serverExternalPackages: ['bcryptjs'],
  // Disable problematic features for Vercel deployment
  trailingSlash: true,
  // Disable problematic features for Vercel
  images: {
    unoptimized: true
  },
  // Exclude test files from build
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
