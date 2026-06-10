import type { ExplainContext } from "@/lib/ai/types";

export const DRAFT_NOTE_SYSTEM_PROMPT = `You are assisting a registered Australian migration agent writing internal case notes.
Write concise professional notes in plain English (3–6 sentences).
Do NOT recalculate or change points. Reference the provided scores only.
Do not provide migration advice or guarantee outcomes. Note that estimates require verification on official sources.`;

export const EMAIL_INTRO_SYSTEM_PROMPT = `You are assisting a migration agent writing a short email introduction to a client about their skilled migration points assessment.
Write 2–3 sentences only, warm and professional, plain text (no HTML).
Do NOT recalculate points. Mention the estimated total if provided.
Do not guarantee visa outcomes.`;

export function buildDraftNoteUserPrompt(ctx: ExplainContext): string {
  const top = ctx.suggestions.slice(0, 3).map((s) => `+${s.delta} ${s.label}`).join("; ");
  return [
    `Visa subclass: ${ctx.visaSubclass}`,
    `Total points: ${ctx.total}`,
    `Tier: ${ctx.tier} — ${ctx.tierMessage}`,
    ctx.gap > 0 ? `Gap to target: ${ctx.gap} points` : "At or above indicative target",
    top ? `Top improvement options: ${top}` : "",
    "Write internal agent notes summarizing the assessment for the client file.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildEmailIntroUserPrompt(input: {
  clientName: string;
  total: number;
  visaSubclass: string;
  gap: number;
  suggestions: { label: string; delta: number }[];
}): string {
  const top = input.suggestions.slice(0, 2).map((s) => `+${s.delta} ${s.label}`).join("; ");
  return [
    `Client name: ${input.clientName}`,
    `Subclass: ${input.visaSubclass}`,
    `Estimated points: ${input.total}`,
    input.gap > 0 ? `Gap to competitive target: ${input.gap}` : "",
    top ? `Possible improvements: ${top}` : "",
    "Write a 2–3 sentence email introduction the agent can paste before the assessment report.",
  ]
    .filter(Boolean)
    .join("\n");
}
