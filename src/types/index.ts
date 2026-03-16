// What the frontend sends to the API
export interface GenerateRequest {
  platform: "TWITTER" | "LINKEDIN" | "INSTAGRAM" | "TIKTOK";
  tone: "PROFESSIONAL" | "CASUAL" | "HUMOROUS" | "INSPIRATIONAL";
  prompt: string;
  length: "SHORT" | "LONG";
  generateImage?: boolean; // PRO only — generate an AI image with the post
  orientation?: "PORTRAIT" | "LANDSCAPE" | "SQUARE"; // Image aspect ratio
}

// What the API sends back to the frontend
export interface GenerateResponse {
  id: string;
  content: string;
  platform: string;
  tone: string;
  prompt: string;
  createdAt: string;
  imageUrl?: string | null; // URL of the generated image (if any)
  orientation?: string; // The orientation used for the image
}

// Daily usage info shown in the UI
export interface UsageInfo {
  used: number;
  limit: number;
  plan: "FREE" | "PRO";
}
