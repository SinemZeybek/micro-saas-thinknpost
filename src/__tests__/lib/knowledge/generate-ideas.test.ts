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

import { generateContentIdeas } from "@/lib/knowledge/generate-ideas";

describe("generateContentIdeas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns parsed ideas from Gemini response", async () => {
    const ideas = [
      { title: "Behind the Scenes", summary: "Show your process", platform: "INSTAGRAM" },
      { title: "Quick Tips", summary: "Share 3 tips", platform: "TWITTER" },
      { title: "Industry Insights", summary: "Discuss trends", platform: "LINKEDIN" },
    ];

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(ideas),
    });

    const result = await generateContentIdeas("We sell handmade candles.");

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe("Behind the Scenes");
    expect(result[1].platform).toBe("TWITTER");
  });

  it("handles markdown-wrapped JSON response", async () => {
    const ideas = [{ title: "Test", summary: "Test summary", platform: "TWITTER" }];

    mockGenerateContent.mockResolvedValue({
      text: "```json\n" + JSON.stringify(ideas) + "\n```",
    });

    const result = await generateContentIdeas("Test context");

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Test");
  });

  it("throws on invalid JSON response", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "Sorry, I cannot help with that.",
    });

    await expect(generateContentIdeas("Test")).rejects.toThrow();
  });
});
