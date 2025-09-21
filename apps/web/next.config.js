const path = require('path');
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
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
      '@ai-app-platform/db': path.resolve(__dirname, '../../packages/db/src'),
      '@ai-app-platform/jobs': path.resolve(
        __dirname,
        '../../packages/jobs/src'
      ),
    };
    return config;
  },
};

module.exports = nextConfig;
