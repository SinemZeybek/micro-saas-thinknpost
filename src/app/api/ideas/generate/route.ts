import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildKnowledgeContext, generateContentIdeas } from "@/lib/knowledge";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get source names to return with the response
  const sources = await prisma.knowledgeSource.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });

  const context = await buildKnowledgeContext(session.user.id);

  if (!context) {
    return NextResponse.json(
      { error: "No knowledge sources found. Upload some content first!" },
      { status: 400 }
    );
  }

  try {
    const ideas = await generateContentIdeas(context);

    const sourceNames = sources.map((s) => s.name);
    const sourceNamesStr = sourceNames.join(", ");

    // Save new ideas to database
    const saved = await prisma.$transaction(
      ideas.map((idea) =>
        prisma.contentIdea.create({
          data: {
            userId: session.user.id,
            title: idea.title,
            summary: idea.summary,
            platform: idea.platform,
            sourceNames: sourceNamesStr,
          },
        })
      )
    );

    // Clean up old ideas based on plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const ideaPlan = (user?.plan || "FREE") as "FREE" | "PRO";
    const IDEA_LIMITS = { FREE: 30, PRO: 100 } as const;
    const MAX_IDEAS = IDEA_LIMITS[ideaPlan];
    const totalIdeas = await prisma.contentIdea.count({
      where: { userId: session.user.id },
    });

    if (totalIdeas > MAX_IDEAS) {
      const oldIdeas = await prisma.contentIdea.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip: MAX_IDEAS,
        select: { id: true },
      });

      if (oldIdeas.length > 0) {
        await prisma.contentIdea.deleteMany({
          where: { id: { in: oldIdeas.map((i) => i.id) } },
        });
      }
    }

    return NextResponse.json(
      saved.map((idea) => ({
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        platform: idea.platform,
        sourceNames: idea.sourceNames,
        createdAt: idea.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    console.error("Idea generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate ideas. Please try again." },
      { status: 500 }
    );
  }
}
