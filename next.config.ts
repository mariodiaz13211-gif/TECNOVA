import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Las fotos de producto viajan como parte del formulario de administración.
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
