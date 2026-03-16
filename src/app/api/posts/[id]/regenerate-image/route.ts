import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  generatePostImage,
  PLATFORM_DEFAULT_ORIENTATION,
} from "@/lib/gemini";
import { uploadPostImage } from "@/lib/supabase";

// POST /api/posts/[id]/regenerate-image — regenerate image only
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.plan !== "PRO") {
    return NextResponse.json(
      { error: "Image regeneration is a PRO feature." },
      { status: 403 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const orientation =
    post.orientation || PLATFORM_DEFAULT_ORIENTATION[post.platform] || "SQUARE";

  try {
    const imageResult = await generatePostImage({
      postContent: post.content,
      platform: post.platform,
      orientation,
    });

    if (!imageResult) {
      return NextResponse.json(
        { error: "Image generation failed. Please try again." },
        { status: 500 }
      );
    }

    const imageUrl = await uploadPostImage(
      imageResult.data,
      imageResult.mimeType,
      user.id,
      `${post.id}-${Date.now()}`
    );

    await prisma.post.update({
      where: { id },
      data: { imageUrl, orientation },
    });

    return NextResponse.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Image regeneration error:", err);
    return NextResponse.json(
      { error: "Failed to regenerate image. Please try again." },
      { status: 500 }
    );
  }
}
