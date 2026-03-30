import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    knowledgeSource: { findMany: vi.fn() },
    calendarWeek: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    calendarDay: { deleteMany: vi.fn() },
  },
}));

vi.mock("@/lib/knowledge", () => ({
  buildKnowledgeContext: vi.fn(),
  generateWeeklyCalendar: vi.fn(),
}));

import { GET } from "@/app/api/calendar/route";
import { POST } from "@/app/api/calendar/generate/route";
import { DELETE } from "@/app/api/calendar/[id]/route";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { buildKnowledgeContext, generateWeeklyCalendar } from "@/lib/knowledge";

const mockGetSession = vi.mocked(getSession);
const mockBuildContext = vi.mocked(buildKnowledgeContext);
const mockGenerateCalendar = vi.mocked(generateWeeklyCalendar);

describe("GET /api/calendar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns list of calendar weeks", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(prisma.calendarWeek.findMany).mockResolvedValue([
      {
        id: "week1",
        startDate: new Date("2026-04-06"),
        sourceNames: "product.pdf",
        createdAt: new Date("2026-04-01"),
        days: [
          { id: "d1", dayOfWeek: 0, title: "Monday", summary: "Start", platform: "TWITTER", suggestedTime: "09:00" },
        ],
      },
    ] as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0].days).toHaveLength(1);
  });
});

describe("POST /api/calendar/generate", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("returns 400 if no knowledge sources", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(prisma.knowledgeSource.findMany).mockResolvedValue([] as never);
    mockBuildContext.mockResolvedValue("");

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("No knowledge sources");
  });

  it("generates a calendar successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(prisma.knowledgeSource.findMany).mockResolvedValue([
      { name: "product.pdf" },
    ] as never);
    mockBuildContext.mockResolvedValue("We sell candles.");
    mockGenerateCalendar.mockResolvedValue([
      { dayOfWeek: 0, title: "Mon Post", summary: "Intro", platform: "", suggestedTime: "" },
    ]);

    vi.mocked(prisma.calendarWeek.create).mockResolvedValue({
      id: "week1",
      startDate: new Date("2026-04-06"),
      sourceNames: "product.pdf",
      createdAt: new Date("2026-04-01"),
      days: [
        { id: "d1", dayOfWeek: 0, title: "Mon Post", summary: "Intro", platform: "", suggestedTime: "" },
      ],
    } as never);

    vi.mocked(prisma.calendarWeek.findMany).mockResolvedValue([
      { id: "week1" },
    ] as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ plan: "FREE" } as never);

    const res = await POST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.days).toHaveLength(1);
    expect(data.sourceNames).toBe("product.pdf");
  });
});

describe("DELETE /api/calendar/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 if not authenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "week1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 403 if user does not own the week", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(prisma.calendarWeek.findUnique).mockResolvedValue({
      id: "week1",
      userId: "other-user",
    } as never);

    const res = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "week1" }),
    });
    expect(res.status).toBe(403);
  });

  it("deletes week successfully", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user1" } } as never);
    vi.mocked(prisma.calendarWeek.findUnique).mockResolvedValue({
      id: "week1",
      userId: "user1",
    } as never);
    vi.mocked(prisma.calendarDay.deleteMany).mockResolvedValue({ count: 7 } as never);
    vi.mocked(prisma.calendarWeek.delete).mockResolvedValue({} as never);

    const res = await DELETE(new Request("http://localhost") as never, {
      params: Promise.resolve({ id: "week1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
