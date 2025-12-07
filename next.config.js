/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable typedRoutes to avoid warnings
  typedRoutes: false,
}

module.exports = nextConfig
