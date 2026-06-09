export type AiTask = "explain" | "draft-note";

export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ExplainContext = {
  total: number;
  visaSubclass: string;
  tier: string;
  tierMessage: string;
  breakdown: { category: string; points: number; note?: string; citation?: string }[];
  suggestions: { label: string; delta: number; effort: string }[];
  gap: number;
  targetPoints?: number;
  rulesVersion: string;
};

export type ExplainResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string; code?: "not_configured" | "rate_limited" | "disabled" };
