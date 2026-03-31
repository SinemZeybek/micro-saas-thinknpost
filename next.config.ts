import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" mode makes Next.js output a self-contained server.
  // Instead of needing the entire node_modules folder (~500MB+),
  // it bundles only the files needed to run — perfect for Docker.
  output: "standalone",
};

export default nextConfig;
