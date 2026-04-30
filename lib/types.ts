export type Meta = {
  rows?: Array<{
    label_fr: string;
    label_en: string;
    h_fr: string;
    h_en: string;
    a_fr: string;
    a_en: string;
  }>;
  tiers?: Array<{
    tier: string;
    label_fr: string;
    label_en: string;
  }>;
  messages?: Array<{
    side: "me" | "them";
    text_fr: string;
    text_en: string;
  }>;
  steps?: Array<{
    time: string;
    text_fr: string;
    text_en: string;
  }>;
  before_fr?: string;
  before_en?: string;
  after_fr?: string;
  after_en?: string;
  left_fr?: string;
  left_en?: string;
  right_fr?: string;
  right_en?: string;
};

export type Brief = {
  format: string;
  accent_color: string;
  body_fr: string;
  body_en: string;
  cta_fr: string;
  cta_en: string;
  meta?: Meta;
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
  status: "pending" | "validated" | "declined";
  version: number;
  created_at: string;
};

export type AdVersion = {
  id: string;
  ad_id: string;
  version: number;
  hook_fr: string | null;
  hook_en: string | null;
  brief: string | null;
  correction_notes: string | null;
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
