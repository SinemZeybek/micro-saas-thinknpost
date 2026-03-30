import * as cheerio from "cheerio";

export async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer, header — keep main content
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();

  // Try to grab the main content area first, fall back to body
  const mainContent = $("article, main, [role='main']").text() || $("body").text();

  // Collapse whitespace
  return mainContent.replace(/\s+/g, " ").trim();
}
