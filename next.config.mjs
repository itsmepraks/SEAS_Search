/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Fix Turbopack workspace root warning
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
  // Ignore CSV files during build
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.csv$/,
      type: 'asset/resource',
    })
    return config
  },
}

export default nextConfig
