import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    knowledgeSource: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/knowledge", () => ({
  extractTextFromPdf: vi.fn(),
  extractTextFromFile: vi.fn(),
  extractTextFromUrl: vi.fn(),
  uploadKnowledgeFile: vi.fn(),
}));

import { GET, POST } from "@/app/api/knowledge/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { extractTextFromUrl } from "@/lib/knowledge";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockCount = vi.mocked(prisma.knowledgeSource.count);
const mockCreate = vi.mocked(prisma.knowledgeSource.create);
const mockFindMany = vi.mocked(prisma.knowledgeSource.findMany);
const mockExtractUrl = vi.mocked(extractTextFromUrl);

describe("GET /api/knowledge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns list of sources", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "src1",
        name: "product.pdf",
        type: "PDF",
        createdAt: new Date("2026-01-01"),
        sizeBytes: 1024,
        sourceUrl: null,
      },
    ] as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe("product.pdf");
  });
});

describe("POST /api/knowledge (URL)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const req = new Request("http://localhost/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(401);
  });

  it("returns 400 if URL is missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "user1", plan: "FREE" } as never);
    mockCount.mockResolvedValue(0);

    const req = new Request("http://localhost/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("URL is required");
  });

  it("returns 429 if source limit reached", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "user1", plan: "FREE" } as never);
    mockCount.mockResolvedValue(5);

    const req = new Request("http://localhost/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req as never);
    expect(res.status).toBe(429);
  });

  it("creates a URL source successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "user1", plan: "FREE" } as never);
    mockCount.mockResolvedValue(0);
    mockExtractUrl.mockResolvedValue("Extracted content from website");
    mockCreate.mockResolvedValue({
      id: "src1",
      name: "example.com",
      type: "URL",
      createdAt: new Date("2026-01-01"),
      sizeBytes: 30,
      sourceUrl: "https://example.com",
    } as never);

    const req = new Request("http://localhost/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });

    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("example.com");
    expect(data.type).toBe("URL");
  });
});
