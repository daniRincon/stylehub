/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com", "another-domain.com", "placeholder.svg"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
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
    // Permite que el build continúe incluso si hay errores de ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que el build continúe incluso si hay errores de TypeScript
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
