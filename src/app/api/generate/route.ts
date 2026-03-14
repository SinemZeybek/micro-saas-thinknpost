import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePost } from "@/lib/gemini";
import type { GenerateRequest } from "@/types";

// FREE users get 3 posts/day, PRO users get 50
const DAILY_LIMITS = { FREE: 3, PRO: 50 } as const;

export async function POST(req: NextRequest) {
  // 1. Check if user is logged in
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the request body
  const body: GenerateRequest = await req.json();
  const { platform, tone, prompt } = body;

  // 3. Basic validation
  if (!platform || !tone || !prompt) {
    return NextResponse.json(
      { error: "Platform, tone, and prompt are required" },
      { status: 400 }
    );
  }

  // 4. Check daily usage limit
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reset daily usage if it's a new day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);

  let currentUsage = user.dailyUsage;
  if (today.getTime() !== lastUsage.getTime()) {
    // It's a new day — reset the counter
    currentUsage = 0;
  }

  const limit = DAILY_LIMITS[user.plan];
  if (currentUsage >= limit) {
    return NextResponse.json(
      {
        error: `Daily limit reached (${limit} posts/day on ${user.plan} plan). Upgrade to PRO for more!`,
      },
      { status: 429 }
    );
  }

  try {
    // 5. Call Gemini to generate the post
    const content = await generatePost({ platform, tone, prompt });

    // 6. Save the post to the database and update usage
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          userId: user.id,
          platform,
          tone,
          prompt,
          content,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          dailyUsage: currentUsage + 1,
          lastUsageDate: new Date(),
        },
      }),
    ]);

    // 7. Return the generated post
    return NextResponse.json({
      id: post.id,
      content: post.content,
      platform: post.platform,
      tone: post.tone,
      prompt: post.prompt,
      createdAt: post.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Failed to generate post. Please try again." },
      { status: 500 }
    );
  }
}
