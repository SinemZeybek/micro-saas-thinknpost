/**
 * Polar Webhook Handler — POST /api/webhooks/polar
 *
 * This is the "callback" from Polar. After a user pays,
 * Polar sends a POST request here with event data like:
 * - "subscription.created" → user just subscribed!
 * - "subscription.canceled" → user canceled their subscription
 *
 * We use this to update the user's plan in our database.
 *
 * IMPORTANT: Webhooks need to be verified using the webhook
 * secret to make sure they're really from Polar (not someone
 * faking a payment).
 */

import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  /**
   * Fired when a customer's state changes (e.g., they become active).
   * This is the main event we care about — it tells us the customer
   * has an active subscription so we upgrade them to PRO.
   */
  onCustomerStateChanged: async (payload) => {
    const customer = payload.data;
    const email = customer.email;

    if (!email) return;

    // Check if customer has any active subscriptions
    const hasActiveSubscription =
      customer.activeSubscriptions && customer.activeSubscriptions.length > 0;

    // Update user's plan based on subscription status
    await prisma.user.update({
      where: { email },
      data: {
        plan: hasActiveSubscription ? "PRO" : "FREE",
        polarCustomerId: customer.id,
      },
    });

    console.log(
      `[Polar Webhook] Updated ${email} → ${hasActiveSubscription ? "PRO" : "FREE"}`
    );
  },

  /**
   * Fired when a new order is created (payment completed).
   * We use this as a backup to make sure the user gets upgraded.
   */
  onOrderCreated: async (payload) => {
    const order = payload.data;
    const email = order.customer.email;

    if (!email) return;

    // When an order is created, the customer just paid → upgrade to PRO
    await prisma.user.update({
      where: { email },
      data: {
        plan: "PRO",
        polarCustomerId: order.customer.id,
      },
    });

    console.log(`[Polar Webhook] Order created for ${email} → PRO`);
  },
});
