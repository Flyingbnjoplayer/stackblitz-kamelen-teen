import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
   turbopack: {}, // Add this to silence the error
  /*eslint: {
    // Disable ESLint during builds to avoid circular reference error
    // Type checking is still enforced
    ignoreDuringBuilds: true,
  },*/
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
   },
  typescript: {
    // Keep TypeScript checking enabled
    ignoreBuildErrors: false,
  
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};


export default nextConfig;