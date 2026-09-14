import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
  images: {
    unoptimized: false,
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
