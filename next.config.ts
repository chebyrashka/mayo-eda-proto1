import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.NETLIFY === 'true' ? 'export' : undefined,
};

export default nextConfig;
