/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    externalDir: true
  }
}

module.exports = nextConfig
