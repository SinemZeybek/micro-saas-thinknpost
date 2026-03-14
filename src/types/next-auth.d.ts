import type { Plan } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan: Plan;
      dailyUsage: number;
    };
  }

  interface User {
    plan: Plan;
    dailyUsage: number;
  }
}
