import { GoogleGenAI } from "@google/genai";

/**
 * Gemini Client for ThinkNPost
 *
 * We use two models:
 * - gemini-2.5-flash → text generation (fast, cheap)
 * - gemini-2.5-flash-preview-image-generation → image generation (PRO only)
 *
 * The @google/genai SDK is the new official SDK that supports
 * both text and image generation.
 */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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
  PROFESSIONAL:
    "Formal, authoritative, data-driven. Use industry terminology.",
  CASUAL:
    "Friendly, conversational, relatable. Write like talking to a friend.",
  HUMOROUS:
    "Witty, playful, use wordplay or pop culture references. Keep it light.",
  INSPIRATIONAL:
    "Motivational, uplifting, use powerful language. Include a takeaway message.",
};

// Length guidelines — SHORT is snappy and quick, LONG is detailed
const LENGTH_GUIDELINES: Record<string, string> = {
  SHORT:
    "Keep it brief and punchy. Get to the point quickly. Ideal for quick scrolling.",
  LONG: "Go in-depth. Add more detail, context, and storytelling. Use multiple paragraphs or line breaks for readability.",
};

// ─── TEXT GENERATION ────────────────────────────────────────────

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

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { role: "user", parts: [{ text: systemPrompt + `\n\nTopic: ${prompt}` }] },
    ],
  });

  return (result.text ?? "").trim();
}

// ─── IMAGE GENERATION (PRO ONLY) ───────────────────────────────

// Map our orientation enum to Gemini's aspect ratio format
const ORIENTATION_TO_ASPECT: Record<string, string> = {
  PORTRAIT: "9:16",
  LANDSCAPE: "16:9",
  SQUARE: "1:1",
};

// Default orientation based on platform conventions
export const PLATFORM_DEFAULT_ORIENTATION: Record<string, string> = {
  INSTAGRAM: "SQUARE",
  LINKEDIN: "LANDSCAPE",
  TWITTER: "LANDSCAPE",
  TIKTOK: "PORTRAIT",
};

interface GenerateImageParams {
  postContent: string;
  platform: string;
  orientation: string;
}

/**
 * Generate an image for a social media post using Gemini's native image generation.
 * Returns the base64 image data (without data URI prefix) and MIME type, or null if it fails.
 */
export async function generatePostImage({
  postContent,
  platform,
  orientation,
}: GenerateImageParams): Promise<{ data: string; mimeType: string } | null> {
  const aspectRatio = ORIENTATION_TO_ASPECT[orientation] || "1:1";

  const imagePrompt = `Create a professional, modern social media visual for ${platform}.
The image should visually represent this topic: "${postContent.slice(0, 300)}"
Style: Clean, eye-catching, vibrant colors, modern design.
No text on the image. High quality, suitable for social media.
Aspect ratio: ${aspectRatio}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-image-generation",
      contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
    });

    // Extract the image from the response parts
    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            data: part.inlineData.data!,
            mimeType: part.inlineData.mimeType || "image/png",
          };
        }
      }
    }

    console.error("No image data found in Gemini response");
    return null;
  } catch (err) {
    console.error("Image generation error:", err);
    return null;
  }
}
