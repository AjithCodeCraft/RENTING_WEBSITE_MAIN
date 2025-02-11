/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"], // ✅ Add your domains
  },
};

// Correct ES module export
export default nextConfig;
