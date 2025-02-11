/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["via.placeholder.com"], // ✅ Allow external images
  },
};

module.exports = nextConfig;
