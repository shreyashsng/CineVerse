/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Only add this if you're absolutely sure you want to deploy with type errors
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'm.media-amazon.com',  // For OMDB movie posters
      'ia.media-imdb.com',   // Alternative IMDB image domain
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
      },
      {
        protocol: 'https',
        hostname: 'ia.media-imdb.com',
      },
    ],
  },
}

module.exports = nextConfig 