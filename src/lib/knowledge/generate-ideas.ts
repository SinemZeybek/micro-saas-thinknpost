import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return _ai;
}

export interface ContentIdeaResult {
  title: string;
  summary: string;
  platform: string;
}

export async function generateContentIdeas(
  context: string,
  count: number = 3
): Promise<ContentIdeaResult[]> {
  const prompt = `You are a social media content strategist. You are given multiple sources of information that ALL describe the SAME product or service. Treat all the sources below as one combined knowledge base about this product/service.

Based on this combined knowledge, generate exactly ${count} content ideas for social media posts. Each idea should draw from across ALL the provided sources — combine insights, don't treat each source separately.

Each idea should:
- Have a catchy title
- Include a brief summary of what the post should cover
- Suggest the best platform (TWITTER, LINKEDIN, INSTAGRAM, or TIKTOK)

Combined Product/Service Knowledge (from multiple sources):
${context}

Respond with a JSON array of objects with keys: title, summary, platform.
Return ONLY the JSON array, no markdown formatting or code blocks.`;

  const result = await getAI().models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = (result.text ?? "").trim();

  // Strip markdown code blocks if present
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(cleaned);
}
