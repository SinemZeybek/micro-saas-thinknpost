/**
 * Checkout API Route — POST /api/checkout
 *
 * When a user clicks "Upgrade to PRO", this route:
 * 1. Checks they're logged in
 * 2. Creates a Polar checkout session (like a payment page)
 * 3. Returns the checkout URL so the frontend can redirect them
 *
 * Polar handles all the payment UI, card processing, etc.
 * We just need to tell Polar: "this user wants to buy this product"
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { polar } from "@/lib/polar";

export async function POST() {
  // 1. Make sure the user is logged in
  const session = await getSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Create a checkout session on Polar
    // This generates a payment page URL where the user can enter their card
    const checkout = await polar.checkouts.create({
      // "products" takes an array of product IDs — we only have one (PRO plan)
      products: [process.env.POLAR_PRODUCT_ID!],
      customerEmail: session.user.email,
      successUrl: `${process.env.NEXTAUTH_URL}/checkout/success`,
    });

    // 3. Send the checkout URL back to the frontend
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
