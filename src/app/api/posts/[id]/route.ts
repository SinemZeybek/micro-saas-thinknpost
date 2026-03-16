import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// PATCH /api/posts/[id] — update post content
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post || post.userId !== session.user.id) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { content: content.trim() },
  });

  return NextResponse.json({ success: true, content: updated.content });
}

// DELETE /api/posts/[id] — delete a post
export async function DELETE(
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

  // Delete the post
  await prisma.post.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
