import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { buildKnowledgeContext } from "@/lib/knowledge";
import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  return _ai;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { existingIdeas } = await req.json();

  const context = await buildKnowledgeContext(session.user.id);

  const prompt = `You are a content strategist. Generate ONE new content idea for a product/service.

${context ? `Product/Service Knowledge:\n${context}\n` : ""}
The following ideas already exist for this day, so create something DIFFERENT:
${(existingIdeas || []).map((t: string) => `- ${t}`).join("\n")}

Respond with a JSON object with keys: title, summary.
- title: a catchy, unique content title
- summary: a brief description of what to post (2-3 sentences)
Return ONLY the JSON object, no markdown formatting or code blocks.`;

  try {
    const result = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = (result.text ?? "").trim();
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const idea = JSON.parse(cleaned);

    return NextResponse.json({
      title: idea.title,
      summary: idea.summary,
    });
  } catch (err) {
    console.error("Another idea generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate idea" },
      { status: 500 }
    );
  }
}
