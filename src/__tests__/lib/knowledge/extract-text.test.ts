import { describe, it, expect } from "vitest";
import { extractTextFromFile } from "@/lib/knowledge/extract-text";

describe("extractTextFromFile", () => {
  it("extracts text from a buffer", () => {
    const buffer = Buffer.from("Hello, this is my product description.");
    const result = extractTextFromFile(buffer);
    expect(result).toBe("Hello, this is my product description.");
  });

  it("trims whitespace", () => {
    const buffer = Buffer.from("  some text with spaces  \n\n");
    const result = extractTextFromFile(buffer);
    expect(result).toBe("some text with spaces");
  });

  it("handles empty buffer", () => {
    const buffer = Buffer.from("");
    const result = extractTextFromFile(buffer);
    expect(result).toBe("");
  });

  it("handles UTF-8 characters", () => {
    const buffer = Buffer.from("Ürün açıklaması: ThinkNPost çok iyi!");
    const result = extractTextFromFile(buffer);
    expect(result).toBe("Ürün açıklaması: ThinkNPost çok iyi!");
  });
});
