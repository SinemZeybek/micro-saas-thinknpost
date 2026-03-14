import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/posts/[id]/favorite — toggle isFavorite on a post
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Find the post and make sure it belongs to this user
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Toggle the favorite status
  const updated = await prisma.post.update({
    where: { id },
    data: { isFavorite: !post.isFavorite },
  });

  return NextResponse.json({
    id: updated.id,
    isFavorite: updated.isFavorite,
  });
}
