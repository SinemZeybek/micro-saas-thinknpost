import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  generatePost,
  generatePostImage,
  PLATFORM_DEFAULT_ORIENTATION,
} from "@/lib/gemini";
import { uploadPostImage } from "@/lib/supabase";
import type { GenerateRequest } from "@/types";

// FREE users get 5 posts/day, PRO users get 50
const DAILY_LIMITS = { FREE: 5, PRO: 200 } as const;

export async function POST(req: NextRequest) {
  // 1. Check if user is logged in
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse the request body
  const body: GenerateRequest = await req.json();
  const { platform, tone, prompt, length, generateImage, orientation } = body;

  // 3. Basic validation
  if (!platform || !tone || !prompt || !length) {
    return NextResponse.json(
      { error: "Platform, tone, prompt, and length are required" },
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

  // 5. If image generation requested, verify PRO plan
  if (generateImage && user.plan !== "PRO") {
    return NextResponse.json(
      { error: "Image generation is a PRO feature. Upgrade to unlock it!" },
      { status: 403 }
    );
  }

  try {
    // 6. Generate the post text with Gemini
    const content = await generatePost({ platform, tone, prompt, length });

    // 7. Determine orientation (use platform default if not specified)
    const finalOrientation =
      orientation || PLATFORM_DEFAULT_ORIENTATION[platform] || "SQUARE";

    // 8. Generate image if requested (PRO only)
    let imageUrl: string | null = null;
    if (generateImage && user.plan === "PRO") {
      const imageResult = await generatePostImage({
        postContent: content,
        platform,
        orientation: finalOrientation,
      });

      if (imageResult) {
        // Upload to Supabase Storage — we create a temp ID for the filename
        const tempId = crypto.randomUUID();
        imageUrl = await uploadPostImage(
          imageResult.data,
          imageResult.mimeType,
          user.id,
          tempId
        );
      }
      // If image generation fails, we still save the post with text only
    }

    // 9. Save the post to the database and update usage
    const [post] = await prisma.$transaction([
      prisma.post.create({
        data: {
          userId: user.id,
          platform,
          tone,
          prompt,
          content,
          length,
          imageUrl,
          orientation: generateImage
            ? (finalOrientation as "PORTRAIT" | "LANDSCAPE" | "SQUARE")
            : undefined,
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

    // 10. Return the generated post
    return NextResponse.json({
      id: post.id,
      content: post.content,
      platform: post.platform,
      tone: post.tone,
      prompt: post.prompt,
      createdAt: post.createdAt.toISOString(),
      imageUrl: post.imageUrl,
      orientation: post.orientation,
    });
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: "Failed to generate post. Please try again." },
      { status: 500 }
    );
  }
}
