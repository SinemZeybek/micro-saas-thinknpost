import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  generateABVariations,
  generatePostImage,
  PLATFORM_DEFAULT_ORIENTATION,
} from "@/lib/gemini";
import { uploadPostImage } from "@/lib/supabase";
import type { GenerateRequest } from "@/types";

const DAILY_LIMITS = { FREE: 5, PRO: 50 } as const;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: GenerateRequest = await req.json();
  const { platform, tone, prompt, length, generateImage, orientation } = body;

  if (!platform || !tone || !prompt || !length) {
    return NextResponse.json(
      { error: "Platform, tone, prompt, and length are required" },
      { status: 400 }
    );
  }

  // Only PRO users can use A/B variations
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.plan !== "PRO") {
    return NextResponse.json(
      { error: "A/B variations is a PRO feature. Upgrade to unlock it!" },
      { status: 403 }
    );
  }

  // Check daily usage — A/B counts as 3 posts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastUsage = new Date(user.lastUsageDate);
  lastUsage.setHours(0, 0, 0, 0);

  let currentUsage = user.dailyUsage;
  if (today.getTime() !== lastUsage.getTime()) {
    currentUsage = 0;
  }

  const limit = DAILY_LIMITS[user.plan];
  if (currentUsage + 3 > limit) {
    return NextResponse.json(
      {
        error: `Not enough daily quota for A/B variations (needs 3, you have ${limit - currentUsage} remaining).`,
      },
      { status: 429 }
    );
  }

  try {
    // Generate 3 text variations
    const variations = await generateABVariations({ platform, tone, prompt, length });

    // Determine orientation
    const finalOrientation =
      orientation || PLATFORM_DEFAULT_ORIENTATION[platform] || "SQUARE";

    // Generate images for each variation if requested
    const imageUrls: (string | null)[] = [];
    if (generateImage) {
      for (const content of variations) {
        try {
          const imageResult = await generatePostImage({
            postContent: content,
            platform,
            orientation: finalOrientation,
          });
          if (imageResult) {
            const tempId = crypto.randomUUID();
            const url = await uploadPostImage(
              imageResult.data,
              imageResult.mimeType,
              user.id,
              tempId
            );
            imageUrls.push(url);
          } else {
            imageUrls.push(null);
          }
        } catch {
          imageUrls.push(null);
        }
      }
    }

    // Save all variations to the database
    const posts = await prisma.$transaction(
      variations.map((content, i) =>
        prisma.post.create({
          data: {
            userId: user.id,
            platform,
            tone,
            prompt,
            content,
            length,
            imageUrl: imageUrls[i] ?? null,
            orientation: generateImage
              ? (finalOrientation as "PORTRAIT" | "LANDSCAPE" | "SQUARE")
              : undefined,
          },
        })
      )
    );

    // Update usage count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        dailyUsage: currentUsage + variations.length,
        lastUsageDate: new Date(),
      },
    });

    // Return all variations
    return NextResponse.json({
      variations: posts.map((post) => ({
        id: post.id,
        content: post.content,
        platform: post.platform,
        tone: post.tone,
        prompt: post.prompt,
        createdAt: post.createdAt.toISOString(),
        imageUrl: post.imageUrl,
        orientation: post.orientation,
      })),
    });
  } catch (err) {
    console.error("A/B generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate A/B variations. Please try again." },
      { status: 500 }
    );
  }
}
