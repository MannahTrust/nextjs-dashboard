import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Example: Whitelist images from Twitter
        port: '',
        pathname: '/customers/**', // Example: Allow only images from the profile_images path
      },
      // You can add more domains here as needed
      // For example, to allow your placeholder to work (NOT RECOMMENDED FOR PRODUCTION):
      // {
      //   protocol: 'https',
      //   hostname: 'www.customers',
      // },
    ],
  },
};

export default nextConfig;
