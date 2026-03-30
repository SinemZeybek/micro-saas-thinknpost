import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeSource: {
      findMany: vi.fn(),
    },
  },
}));

import { buildKnowledgeContext } from "@/lib/knowledge/build-context";
import { prisma } from "@/lib/prisma";

const mockFindMany = vi.mocked(prisma.knowledgeSource.findMany);

describe("buildKnowledgeContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty string when user has no sources", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await buildKnowledgeContext("user1");
    expect(result).toBe("");
  });

  it("combines multiple sources with separators", async () => {
    mockFindMany.mockResolvedValue([
      { name: "product.pdf", type: "PDF", rawText: "We sell shoes." },
      { name: "about.txt", type: "TEXT", rawText: "Founded in 2024." },
    ] as never);

    const result = await buildKnowledgeContext("user1");

    expect(result).toContain("[PDF: product.pdf]");
    expect(result).toContain("We sell shoes.");
    expect(result).toContain("[TEXT: about.txt]");
    expect(result).toContain("Founded in 2024.");
    expect(result).toContain("---");
  });

  it("queries with correct userId", async () => {
    mockFindMany.mockResolvedValue([]);

    await buildKnowledgeContext("user42");

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId: "user42" },
      orderBy: { createdAt: "asc" },
      select: { name: true, type: true, rawText: true },
    });
  });
});
