import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET /api/posts/export — export all posts as CSV
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Build CSV
  const headers = [
    "Date",
    "Platform",
    "Tone",
    "Length",
    "Prompt",
    "Content",
    "Favorite",
  ];

  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = posts.map((post) =>
    [
      new Date(post.createdAt).toISOString(),
      post.platform,
      post.tone,
      post.length || "SHORT",
      escapeCSV(post.prompt),
      escapeCSV(post.content),
      post.isFavorite ? "Yes" : "No",
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="thinknpost-posts-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
