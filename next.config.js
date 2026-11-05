/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Not a static export: /api/statement runs on the server to keep the Claude API key secret.
};

module.exports = nextConfig;
