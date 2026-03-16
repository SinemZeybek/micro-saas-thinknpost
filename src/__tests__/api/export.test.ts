import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
    },
  },
}));

import { GET } from "@/app/api/posts/export/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getSession);
const mockFindMany = vi.mocked(prisma.post.findMany);

describe("GET /api/posts/export", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns CSV with correct headers", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "post1",
        createdAt: new Date("2026-01-15T10:00:00Z"),
        platform: "TWITTER",
        tone: "CASUAL",
        length: "SHORT",
        prompt: "test prompt",
        content: "test content",
        isFavorite: true,
      },
    ] as never);

    const res = await GET();
    const text = await res.text();

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("thinknpost-posts-");
    expect(text).toContain("Date,Platform,Tone,Length,Prompt,Content,Favorite");
    expect(text).toContain("TWITTER");
    expect(text).toContain("CASUAL");
    expect(text).toContain("Yes"); // isFavorite: true
  });

  it("escapes CSV values with commas", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindMany.mockResolvedValue([
      {
        id: "post1",
        createdAt: new Date("2026-01-15T10:00:00Z"),
        platform: "LINKEDIN",
        tone: "PROFESSIONAL",
        length: "LONG",
        prompt: "test, with comma",
        content: 'content with "quotes"',
        isFavorite: false,
      },
    ] as never);

    const res = await GET();
    const text = await res.text();

    expect(text).toContain('"test, with comma"');
    expect(text).toContain('"content with ""quotes"""');
  });
});
