import { GoogleGenerativeAI } from "@google/generative-ai";

// Create the Gemini client — uses your API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// We use Gemini 2.5 Flash — fast and cheap, perfect for text generation
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Platform-specific rules so the AI writes appropriate content
const PLATFORM_GUIDELINES: Record<string, string> = {
  TWITTER:
    "Keep it under 280 characters. Use a punchy, concise style. Hashtags are optional (1-3 max).",
  LINKEDIN:
    "Professional tone. Can be longer (up to 3000 chars). Use line breaks for readability. Add a call-to-action at the end.",
  INSTAGRAM:
    "Engaging and visual. Use emojis. Include 5-10 relevant hashtags at the end. Write a caption that tells a story.",
  TIKTOK:
    "Trendy, engaging, and hook-driven. Start with a strong hook in the first line to grab attention. Use casual language, emojis, and trending phrases. Include 3-5 relevant hashtags at the end.",
};

const TONE_GUIDELINES: Record<string, string> = {
  PROFESSIONAL: "Formal, authoritative, data-driven. Use industry terminology.",
  CASUAL: "Friendly, conversational, relatable. Write like talking to a friend.",
  HUMOROUS: "Witty, playful, use wordplay or pop culture references. Keep it light.",
  INSPIRATIONAL:
    "Motivational, uplifting, use powerful language. Include a takeaway message.",
};

// Length guidelines — SHORT is snappy and quick, LONG is detailed
const LENGTH_GUIDELINES: Record<string, string> = {
  SHORT: "Keep it brief and punchy. Get to the point quickly. Ideal for quick scrolling.",
  LONG: "Go in-depth. Add more detail, context, and storytelling. Use multiple paragraphs or line breaks for readability.",
};

interface GeneratePostParams {
  platform: string;
  tone: string;
  prompt: string;
  length: string;
}

export async function generatePost({
  platform,
  tone,
  prompt,
  length,
}: GeneratePostParams): Promise<string> {
  const systemPrompt = `You are a social media content expert. Generate a single post based on the user's topic.

Platform: ${platform}
${PLATFORM_GUIDELINES[platform]}

Tone: ${tone}
${TONE_GUIDELINES[tone]}

Length: ${length}
${LENGTH_GUIDELINES[length]}

Rules:
- Output ONLY the post text, nothing else
- No quotes around the text
- No "Here's a post:" prefix
- Make it feel authentic, not AI-generated`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `Topic: ${prompt}` },
  ]);

  const response = result.response;
  return response.text().trim();
}
