/**
 * Polar Webhook Handler — POST /api/webhooks/polar
 *
 * This is the "callback" from Polar. After a user pays,
 * Polar sends a POST request here with event data like:
 * - "subscription.created" → user just subscribed!
 * - "subscription.canceled" → user canceled their subscription
 *
 * We use this to update the user's plan in our database.
 */

import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onCustomerStateChanged: async (payload) => {
    const customer = payload.data;
    const email = customer.email;

    if (!email) return;

    const hasActiveSubscription =
      customer.activeSubscriptions && customer.activeSubscriptions.length > 0;

    // Get subscription details for end date
    const activeSub = hasActiveSubscription
      ? customer.activeSubscriptions[0]
      : null;

    await prisma.user.update({
      where: { email },
      data: {
        plan: hasActiveSubscription ? "PRO" : "FREE",
        polarCustomerId: customer.id,
        polarSubscriptionId: activeSub?.id ?? null,
        subscriptionEndsAt: activeSub?.currentPeriodEnd
          ? new Date(activeSub.currentPeriodEnd)
          : null,
      },
    });

    console.log(
      `[Polar Webhook] Updated ${email} → ${hasActiveSubscription ? "PRO" : "FREE"}`
    );
  },

  onOrderCreated: async (payload) => {
    const order = payload.data;
    const email = order.customer.email;

    if (!email) return;

    await prisma.user.update({
      where: { email },
      data: {
        plan: "PRO",
        polarCustomerId: order.customer.id,
      },
    });

    console.log(`[Polar Webhook] Order created for ${email} → PRO`);
  },

  onSubscriptionCreated: async (payload) => {
    const sub = payload.data;
    const email = sub.customer?.email;

    if (!email) return;

    await prisma.user.update({
      where: { email },
      data: {
        plan: "PRO",
        polarCustomerId: sub.customer?.id,
        polarSubscriptionId: sub.id,
        subscriptionEndsAt: sub.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd)
          : null,
      },
    });

    console.log(`[Polar Webhook] Subscription created for ${email} → PRO`);
  },

  onSubscriptionUpdated: async (payload) => {
    const sub = payload.data;
    const email = sub.customer?.email;

    if (!email) return;

    const isCanceled = sub.cancelAtPeriodEnd === true;

    await prisma.user.update({
      where: { email },
      data: {
        // Keep PRO until period ends
        polarSubscriptionId: sub.id,
        subscriptionEndsAt: sub.currentPeriodEnd
          ? new Date(sub.currentPeriodEnd)
          : null,
      },
    });

    console.log(
      `[Polar Webhook] Subscription updated for ${email}, canceled: ${isCanceled}`
    );
  },
});
