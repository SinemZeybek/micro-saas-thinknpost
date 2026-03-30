import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export interface CalendarDayResult {
  dayOfWeek: number;
  title: string;
  summary: string;
  platform: string;
  suggestedTime: string;
}

export async function generateWeeklyCalendar(
  context: string
): Promise<CalendarDayResult[]> {
  const prompt = `You are a content strategist. You are given information about a product/service. Create a 7-day content idea calendar starting from today (Day 1 = today, Day 7 = 6 days from now).

Each day should have a unique content idea that:
- Has a catchy, specific title
- Has a brief summary explaining the angle or hook (2-3 sentences)
- Has a suggested posting time (use common high-engagement times like "09:00", "12:00", "17:00", "18:30", "20:00")
- Follows a logical content flow through the 7 days (e.g., start with awareness, build engagement, end with a call-to-action)
- Covers different aspects of the product/service across the week
- Combines knowledge from ALL provided sources when relevant

Product/Service Knowledge:
${context}

Respond with a JSON array of 7 objects with keys: dayOfWeek (0 = Day 1/today, 1 = Day 2, ..., 6 = Day 7), title, summary, platform (set to ""), suggestedTime.
Return ONLY the JSON array, no markdown formatting or code blocks.`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = (result.text ?? "").trim();
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const days: CalendarDayResult[] = JSON.parse(cleaned);

  // Ensure we have exactly 7 days, sorted by dayOfWeek
  return days
    .slice(0, 7)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

export { DAY_NAMES };
