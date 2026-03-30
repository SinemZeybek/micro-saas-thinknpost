import { extractText } from "unpdf";

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const result = await extractText(new Uint8Array(buffer));
  const text = Array.isArray(result.text)
    ? result.text.join("\n\n")
    : String(result.text || "");
  return text.trim();
}
