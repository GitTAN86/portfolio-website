/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true, // Recommended for clean routes on cPanel Apache servers
};

export default nextConfig;