import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies before importing the route
vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    post: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/gemini", () => ({
  generatePost: vi.fn(),
  generatePostImage: vi.fn(),
  PLATFORM_DEFAULT_ORIENTATION: {
    INSTAGRAM: "SQUARE",
    LINKEDIN: "LANDSCAPE",
    TWITTER: "LANDSCAPE",
    TIKTOK: "PORTRAIT",
  },
}));

vi.mock("@/lib/supabase", () => ({
  uploadPostImage: vi.fn(),
}));

import { POST } from "@/app/api/generate/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { generatePost } from "@/lib/gemini";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.user.findUnique);
const mockGeneratePost = vi.mocked(generatePost);
const mockTransaction = vi.mocked(prisma.$transaction);

function createRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await POST(createRequest({ platform: "TWITTER", tone: "CASUAL", prompt: "test", length: "SHORT" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if required fields are missing", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);

    const res = await POST(createRequest({ platform: "TWITTER" }));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("required");
  });

  it("returns 404 if user not found in database", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue(null);

    const res = await POST(
      createRequest({ platform: "TWITTER", tone: "CASUAL", prompt: "test", length: "SHORT" })
    );
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("returns 429 if daily limit is reached", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({
      id: "user1",
      plan: "FREE",
      dailyUsage: 5,
      lastUsageDate: new Date(),
    } as never);

    const res = await POST(
      createRequest({ platform: "TWITTER", tone: "CASUAL", prompt: "test", length: "SHORT" })
    );
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toContain("Daily limit");
  });

  it("returns 403 if FREE user tries image generation", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({
      id: "user1",
      plan: "FREE",
      dailyUsage: 0,
      lastUsageDate: new Date(0),
    } as never);

    const res = await POST(
      createRequest({
        platform: "TWITTER",
        tone: "CASUAL",
        prompt: "test",
        length: "SHORT",
        generateImage: true,
      })
    );
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("PRO feature");
  });

  it("generates a post successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({
      id: "user1",
      plan: "FREE",
      dailyUsage: 0,
      lastUsageDate: new Date(0),
    } as never);
    mockGeneratePost.mockResolvedValue("Generated post content");
    mockTransaction.mockResolvedValue([
      {
        id: "post1",
        content: "Generated post content",
        platform: "TWITTER",
        tone: "CASUAL",
        prompt: "test",
        createdAt: new Date("2026-01-01"),
        imageUrl: null,
        orientation: null,
      },
      {},
    ] as never);

    const res = await POST(
      createRequest({ platform: "TWITTER", tone: "CASUAL", prompt: "test", length: "SHORT" })
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.content).toBe("Generated post content");
    expect(data.platform).toBe("TWITTER");
  });
});
