import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'another-domain.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  async rewrites() {
    return [
      {
        source: '/blog/:slug',
        destination: '/posts/:slug',
      },
    ];
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'es',
  },
};

export default nextConfig;