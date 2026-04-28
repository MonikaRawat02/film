/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  
  // Enable gzip/brotli compression
  compress: true,
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // Modern image formats
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Production optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize package imports
  optimizePackageImports: ['lucide-react', 'framer-motion'],
  
  async rewrites() {
    return [
      {
        source: '/hollywood/movies/:slug*',
        destination: '/category/hollywood/:slug*',
      },
      {
        source: '/bollywood/movies/:slug*',
        destination: '/category/bollywood/:slug*',
      },
      {
        source: '/articles/:category/:slug*',
        destination: '/category/:category/:slug*',
      },
      {
        source: '/ott/:slug((?!.*\/).*)',
        destination: '/ott/streaming/:slug',
      }
    ]
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        // Cache static assets
        source: '/(.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
