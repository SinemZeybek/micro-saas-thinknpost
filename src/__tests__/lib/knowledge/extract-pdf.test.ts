import { describe, it, expect, vi } from "vitest";

vi.mock("unpdf", () => ({
  extractText: vi.fn(),
}));

import { extractTextFromPdf } from "@/lib/knowledge/extract-pdf";
import { extractText } from "unpdf";

const mockExtractText = vi.mocked(extractText);

describe("extractTextFromPdf", () => {
  it("extracts text from a PDF buffer", async () => {
    mockExtractText.mockResolvedValue({ text: "  Product overview content  " } as never);

    const buffer = Buffer.from("fake-pdf-data");
    const result = await extractTextFromPdf(buffer);

    expect(result).toBe("Product overview content");
  });

  it("handles empty PDF", async () => {
    mockExtractText.mockResolvedValue({ text: "" } as never);

    const buffer = Buffer.from("fake-pdf-data");
    const result = await extractTextFromPdf(buffer);

    expect(result).toBe("");
  });

  it("handles null text", async () => {
    mockExtractText.mockResolvedValue({ text: null } as never);

    const buffer = Buffer.from("fake-pdf-data");
    const result = await extractTextFromPdf(buffer);

    expect(result).toBe("");
  });
});
