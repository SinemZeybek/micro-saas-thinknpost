import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weeks = await prisma.calendarWeek.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  return NextResponse.json(
    weeks.map((week) => ({
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
    }))
  );
}
