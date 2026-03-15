import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Vercel to include the Prisma query engine in serverless functions
  outputFileTracingIncludes: {
    "/api/**/*": ["./src/generated/prisma/**/*"],
    "/dashboard": ["./src/generated/prisma/**/*"],
    "/generate": ["./src/generated/prisma/**/*"],
    "/favorites": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
