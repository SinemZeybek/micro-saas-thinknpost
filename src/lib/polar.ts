/**
 * Polar.sh Client
 *
 * This file creates a reusable Polar SDK instance.
 * Think of it like our prisma.ts file — one shared client
 * that all our API routes can import.
 *
 * We use "sandbox" mode during development so no real
 * money is charged. Switch to "production" when you go live.
 */

import { Polar } from "@polar-sh/sdk";

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "production",
});
