import { prisma } from "@/lib/prisma";

export async function buildKnowledgeContext(userId: string): Promise<string> {
  const sources = await prisma.knowledgeSource.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { name: true, type: true, rawText: true },
  });

  if (sources.length === 0) return "";

  return sources
    .map((s) => `[${s.type}: ${s.name}]\n${s.rawText}`)
    .join("\n\n---\n\n");
}
