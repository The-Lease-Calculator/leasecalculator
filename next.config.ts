import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow large image uploads to the analyze API route
  api: {
    bodyParser: false,
  },
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
  },
}

export default nextConfig
