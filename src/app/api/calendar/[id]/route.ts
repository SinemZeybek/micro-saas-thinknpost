import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const week = await prisma.calendarWeek.findUnique({
    where: { id },
  });

  if (!week) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (week.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete days first, then the week
  await prisma.calendarDay.deleteMany({
    where: { calendarWeekId: id },
  });
  await prisma.calendarWeek.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
