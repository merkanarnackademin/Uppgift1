/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // App Router is default in Next 13+, ensure it's enabled
    appDir: true
  }
};

module.exports = nextConfig;
