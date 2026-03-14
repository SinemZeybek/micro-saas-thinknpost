// What the frontend sends to the API
export interface GenerateRequest {
  platform: "TWITTER" | "LINKEDIN" | "INSTAGRAM";
  tone: "PROFESSIONAL" | "CASUAL" | "HUMOROUS" | "INSPIRATIONAL";
  prompt: string;
}

// What the API sends back to the frontend
export interface GenerateResponse {
  id: string;
  content: string;
  platform: string;
  tone: string;
  prompt: string;
  createdAt: string;
}

// Daily usage info shown in the UI
export interface UsageInfo {
  used: number;
  limit: number;
  plan: "FREE" | "PRO";
}
