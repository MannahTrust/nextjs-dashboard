import type { NextConfig } from 'next';

/* const nextConfig: NextConfig = {
  
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hloxoqwhufjkgglnblrs.supabase.co', // Example: Whitelist images from Twitter
        port: '',
        pathname: '/storage/v1/s3/public/customer-images/**', // Example: Allow only images from the profile_images path
      },
      
    ],
  },
}; */

const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // This is your specific Supabase project hostname from the error log.
        hostname: 'hloxoqwhufjkgglnblrs.supabase.co',
        port: '',
        // This allows all images from your 'customer-images' bucket.
        pathname: '/storage/v1/object/public/customer-images/**',
      },
    ],
  },
};

export default nextConfig;
