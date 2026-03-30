import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeSource: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { DELETE } from "@/app/api/knowledge/[id]/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(prisma.knowledgeSource.findUnique);
const mockDelete = vi.mocked(prisma.knowledgeSource.delete);

function createRequest() {
  return new Request("http://localhost/api/knowledge/src1", {
    method: "DELETE",
  });
}

describe("DELETE /api/knowledge/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(createRequest() as never, {
      params: Promise.resolve({ id: "src1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 if source not found", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue(null);

    const res = await DELETE(createRequest() as never, {
      params: Promise.resolve({ id: "src1" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 403 if user does not own the source", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({
      id: "src1",
      userId: "other-user",
    } as never);

    const res = await DELETE(createRequest() as never, {
      params: Promise.resolve({ id: "src1" }),
    });
    expect(res.status).toBe(403);
  });

  it("deletes source successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    mockFindUnique.mockResolvedValue({
      id: "src1",
      userId: "user1",
    } as never);
    mockDelete.mockResolvedValue({} as never);

    const res = await DELETE(createRequest() as never, {
      params: Promise.resolve({ id: "src1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
