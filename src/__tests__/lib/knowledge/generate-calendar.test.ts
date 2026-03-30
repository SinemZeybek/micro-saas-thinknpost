import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGenerateContent } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  return { mockGenerateContent };
});

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGenerateContent };
  },
}));

import { generateWeeklyCalendar } from "@/lib/knowledge/generate-calendar";

describe("generateWeeklyCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 7 days sorted by dayOfWeek", async () => {
    const days = [
      { dayOfWeek: 2, title: "Wednesday Post", summary: "Mid-week tips", platform: "LINKEDIN", suggestedTime: "09:00" },
      { dayOfWeek: 0, title: "Monday Post", summary: "Start the week", platform: "TWITTER", suggestedTime: "08:00" },
      { dayOfWeek: 6, title: "Sunday Post", summary: "Week recap", platform: "INSTAGRAM", suggestedTime: "18:00" },
      { dayOfWeek: 1, title: "Tuesday Post", summary: "Deep dive", platform: "LINKEDIN", suggestedTime: "12:00" },
      { dayOfWeek: 3, title: "Thursday Post", summary: "BTS", platform: "TIKTOK", suggestedTime: "17:00" },
      { dayOfWeek: 4, title: "Friday Post", summary: "Fun content", platform: "INSTAGRAM", suggestedTime: "18:30" },
      { dayOfWeek: 5, title: "Saturday Post", summary: "Weekend vibes", platform: "TIKTOK", suggestedTime: "20:00" },
    ];

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(days),
    });

    const result = await generateWeeklyCalendar("We sell candles.");

    expect(result).toHaveLength(7);
    expect(result[0].dayOfWeek).toBe(0);
    expect(result[6].dayOfWeek).toBe(6);
    expect(result[0].title).toBe("Monday Post");
  });

  it("handles markdown-wrapped JSON", async () => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      title: `Day ${i}`,
      summary: "Summary",
      platform: "TWITTER",
      suggestedTime: "09:00",
    }));

    mockGenerateContent.mockResolvedValue({
      text: "```json\n" + JSON.stringify(days) + "\n```",
    });

    const result = await generateWeeklyCalendar("Test context");
    expect(result).toHaveLength(7);
  });
});
