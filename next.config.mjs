/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/hollywood/movies/:slug*',
        destination: '/category/hollywood/:slug*',
      },
      {
        source: '/bollywood/movies/:slug*',
        destination: '/category/bollywood/:slug*',
      }
    ]
  },
};

export default nextConfig;
