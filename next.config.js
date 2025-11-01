/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@tsparticles/slim', '@tsparticles/react'],
  env: {
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
    AI_STRATEGY: process.env.AI_STRATEGY || 'intelligent'
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
<<<<<<< HEAD
  },
  output: 'standalone',
  experimental: {
    serverActions: true
=======
>>>>>>> c6bdffe9494c224c582eb687ffca3e5c6ae5a505
  }
};

module.exports = nextConfig;