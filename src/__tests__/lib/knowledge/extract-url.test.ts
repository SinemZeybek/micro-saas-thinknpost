import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractTextFromUrl } from "@/lib/knowledge/extract-url";

describe("extractTextFromUrl", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("extracts text from HTML page", async () => {
    const html = `
      <html>
        <head><title>Test</title></head>
        <body>
          <nav>Navigation</nav>
          <main>
            <h1>Our Product</h1>
            <p>ThinkNPost helps you create content.</p>
          </main>
          <footer>Footer</footer>
        </body>
      </html>
    `;

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => html,
    } as Response);

    const result = await extractTextFromUrl("https://example.com");

    expect(result).toContain("Our Product");
    expect(result).toContain("ThinkNPost helps you create content.");
    expect(result).not.toContain("Navigation");
    expect(result).not.toContain("Footer");
  });

  it("throws on failed fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    await expect(extractTextFromUrl("https://example.com/nope")).rejects.toThrow(
      "Failed to fetch URL: 404"
    );
  });

  it("removes script and style tags", async () => {
    const html = `
      <html><body>
        <script>alert('bad')</script>
        <style>.hidden{display:none}</style>
        <p>Clean content here</p>
      </body></html>
    `;

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      text: async () => html,
    } as Response);

    const result = await extractTextFromUrl("https://example.com");

    expect(result).toContain("Clean content here");
    expect(result).not.toContain("alert");
    expect(result).not.toContain("display:none");
  });
});
