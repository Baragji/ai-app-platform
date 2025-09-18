/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ai-app-platform/config',
    '@ai-app-platform/db',
    '@ai-app-platform/jobs',
    '@ai-app-platform/observability',
  ],
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = nextConfig;
