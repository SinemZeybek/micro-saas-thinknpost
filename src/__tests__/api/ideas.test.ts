import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    knowledgeSource: {
      findMany: vi.fn(),
    },
    contentIdea: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/knowledge", () => ({
  buildKnowledgeContext: vi.fn(),
  generateContentIdeas: vi.fn(),
}));

import { POST } from "@/app/api/ideas/generate/route";
import { GET } from "@/app/api/ideas/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildKnowledgeContext, generateContentIdeas } from "@/lib/knowledge";

const mockGetSession = vi.mocked(getSession);
const mockBuildContext = vi.mocked(buildKnowledgeContext);
const mockGenerateIdeas = vi.mocked(generateContentIdeas);
const mockTransaction = vi.mocked(prisma.$transaction);
const mockFindMany = vi.mocked(prisma.contentIdea.findMany);
const mockKnowledgeFindMany = vi.mocked(prisma.knowledgeSource.findMany);
const mockDeleteMany = vi.mocked(prisma.contentIdea.deleteMany);
const mockCount = vi.mocked(prisma.contentIdea.count);

describe("POST /api/ideas/generate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 400 if no knowledge sources exist", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockKnowledgeFindMany.mockResolvedValue([] as never);
    mockBuildContext.mockResolvedValue("");

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("No knowledge sources");
  });

  it("generates and saves ideas successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockKnowledgeFindMany.mockResolvedValue([
      { name: "product.pdf" },
      { name: "about.txt" },
    ] as never);
    mockBuildContext.mockResolvedValue("We sell organic candles.");
    mockGenerateIdeas.mockResolvedValue([
      { title: "Candle Care Tips", summary: "Share maintenance tips", platform: "INSTAGRAM" },
      { title: "Behind the Wax", summary: "Show production process", platform: "TIKTOK" },
    ]);
    mockTransaction.mockResolvedValue([
      {
        id: "idea1",
        title: "Candle Care Tips",
        summary: "Share maintenance tips",
        platform: "INSTAGRAM",
        sourceNames: "product.pdf, about.txt",
        createdAt: new Date("2026-01-01"),
      },
      {
        id: "idea2",
        title: "Behind the Wax",
        summary: "Show production process",
        platform: "TIKTOK",
        sourceNames: "product.pdf, about.txt",
        createdAt: new Date("2026-01-01"),
      },
    ] as never);
    mockCount.mockResolvedValue(2 as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ plan: "FREE" } as never);

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].title).toBe("Candle Care Tips");
    expect(data[0].sourceNames).toBe("product.pdf, about.txt");
  });
});

describe("GET /api/ideas", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns list of ideas", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "idea1",
        title: "Test Idea",
        summary: "Test summary",
        platform: "TWITTER",
        createdAt: new Date("2026-01-01"),
      },
    ] as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].title).toBe("Test Idea");
  });
});
