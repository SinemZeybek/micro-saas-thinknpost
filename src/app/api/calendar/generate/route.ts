import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildKnowledgeContext, generateWeeklyCalendar } from "@/lib/knowledge";

export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await prisma.knowledgeSource.findMany({
    where: { userId: session.user.id },
    select: { name: true },
  });

  const context = await buildKnowledgeContext(session.user.id);

  if (!context) {
    return NextResponse.json(
      { error: "No knowledge sources found. Add content to ThinkBank first!" },
      { status: 400 }
    );
  }

  try {
    const days = await generateWeeklyCalendar(context);
    const sourceNamesStr = sources.map((s) => s.name).join(", ");

    // Start date is today
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const week = await prisma.calendarWeek.create({
      data: {
        userId: session.user.id,
        startDate,
        sourceNames: sourceNamesStr,
        days: {
          create: days.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            title: day.title,
            summary: day.summary,
            platform: day.platform,
            suggestedTime: day.suggestedTime,
          })),
        },
      },
      include: {
        days: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    // Keep only the last N weeks based on plan
    const calUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const WEEK_LIMITS = { FREE: 1, PRO: 4 } as const;
    const maxWeeks = WEEK_LIMITS[(calUser?.plan || "FREE") as "FREE" | "PRO"];

    const allWeeks = await prisma.calendarWeek.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (allWeeks.length > maxWeeks) {
      const oldIds = allWeeks.slice(maxWeeks).map((w) => w.id);
      await prisma.calendarDay.deleteMany({
        where: { calendarWeekId: { in: oldIds } },
      });
      await prisma.calendarWeek.deleteMany({
        where: { id: { in: oldIds } },
      });
    }

    return NextResponse.json({
      id: week.id,
      startDate: week.startDate.toISOString(),
      sourceNames: week.sourceNames,
      createdAt: week.createdAt.toISOString(),
      days: week.days.map((day) => ({
        id: day.id,
        dayOfWeek: day.dayOfWeek,
        title: day.title,
        summary: day.summary,
        platform: day.platform,
        suggestedTime: day.suggestedTime,
      })),
    });
  } catch (err) {
    console.error("Calendar generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate calendar. Please try again." },
      { status: 500 }
    );
  }
}
