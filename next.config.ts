/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placeholder.svg",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  },
  async rewrites() {
    return [
      {
        source: "/blog/:slug",
        destination: "/posts/:slug",
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuración para resolver problemas de client-reference-manifest
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Optimización de output
  output: "standalone",
}

module.exports = nextConfig
