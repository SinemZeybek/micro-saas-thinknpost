import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { PATCH, DELETE } from "@/app/api/posts/[id]/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.post.findUnique);
const mockUpdate = vi.mocked(prisma.post.update);
const mockDelete = vi.mocked(prisma.post.delete);

function createRequest(method: string, body?: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/posts/post1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as import("next/server").NextRequest;
}

const params = Promise.resolve({ id: "post1" });

describe("PATCH /api/posts/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await PATCH(createRequest("PATCH", { content: "new" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 400 if content is empty", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    const res = await PATCH(createRequest("PATCH", { content: "" }), { params });
    expect(res.status).toBe(400);
  });

  it("returns 404 if post not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue(null);
    const res = await PATCH(createRequest("PATCH", { content: "new content" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 404 if post belongs to another user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "post1", userId: "other-user" } as never);
    const res = await PATCH(createRequest("PATCH", { content: "new content" }), { params });
    expect(res.status).toBe(404);
  });

  it("updates post content successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "post1", userId: "user1" } as never);
    mockUpdate.mockResolvedValue({ id: "post1", content: "updated content" } as never);

    const res = await PATCH(createRequest("PATCH", { content: "updated content" }), { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.content).toBe("updated content");
  });
});

describe("DELETE /api/posts/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(createRequest("DELETE"), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 if post not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue(null);
    const res = await DELETE(createRequest("DELETE"), { params });
    expect(res.status).toBe(404);
  });

  it("deletes post successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({ id: "post1", userId: "user1" } as never);
    mockDelete.mockResolvedValue({} as never);

    const res = await DELETE(createRequest("DELETE"), { params });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: "post1" } });
  });
});
