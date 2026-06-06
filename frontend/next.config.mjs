/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Google Fonts download at build time — use system fonts in Docker
  optimizeFonts: false,
};

export default nextConfig;
