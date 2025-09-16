/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@ai-app-platform/config',
    '@ai-app-platform/db',
    '@ai-app-platform/jobs',
  ],
}

module.exports = nextConfig