import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    typescript: {
    // !! Isso faz o build ignorar erros de TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
