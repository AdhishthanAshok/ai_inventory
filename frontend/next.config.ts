import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CUSTOM_API_URL: process.env.BACKEND_URL,
  },
  allowedDevOrigins: ["192.168.1.7", "http://localhost:3000", "https://ai-inventory-nu.vercel.app"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
