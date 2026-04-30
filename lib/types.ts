export type Brief = {
  format: string;
  accent_color: string;
  body_fr: string;
  body_en: string;
  cta_fr: string;
  cta_en: string;
};

export type Ad = {
  id: string;
  batch_id: string;
  slug: string;
  concept: string;
  hook_fr: string | null;
  hook_en: string | null;
  brief: string | null;
  html_fr: string | null;
  html_en: string | null;
  png_url_fr: string | null;
  png_url_en: string | null;
  position: number | null;
  created_at: string;
};

export type Batch = {
  id: string;
  date: string;
  status: "pending" | "running" | "done" | "failed";
  summary: string | null;
  created_at: string;
};

export type FeedbackRow = {
  id: string;
  ad_id: string;
  rating: number | null;
  verdict: "keep" | "pivot" | "kill" | null;
  notes: string | null;
  created_at: string;
};

export function parseBrief(brief: string | null): Brief | null {
  if (!brief) return null;
  try {
    return JSON.parse(brief) as Brief;
  } catch {
    return null;
  }
}

export const ACCENT_COLORS: Record<string, string> = {
  emerald: "#10b981",
  amber: "#f59e0b",
  yellow: "#fbbf24",
  rose: "#ef4444",
  red: "#ef4444",
  sky: "#0ea5e9",
  violet: "#8b5cf6",
};
