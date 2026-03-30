import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ideas = await prisma.contentIdea.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    ideas.map((idea) => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      platform: idea.platform,
      sourceNames: idea.sourceNames,
      createdAt: idea.createdAt.toISOString(),
    }))
  );
}
