import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { polar } from "@/lib/polar";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.plan !== "PRO" || !user.polarSubscriptionId) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 400 }
    );
  }

  try {
    // Cancel the subscription on Polar
    await polar.subscriptions.revoke({ id: user.polarSubscriptionId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
