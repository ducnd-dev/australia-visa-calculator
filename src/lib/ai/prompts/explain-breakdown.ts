import type { ExplainContext } from "@/lib/ai/types";

export const EXPLAIN_SYSTEM_PROMPT = `You are an assistant helping registered migration agents explain Schedule 6D skilled migration points to clients.

CRITICAL RULES:
- The points total and breakdown are FIXED. Never recalculate, change, or invent point values.
- Only explain what each breakdown line means in plain English.
- Reference Schedule 6D categories; do not provide legal advice or guarantee visa outcomes.
- If asked to change scores, refuse and say to verify on immi.homeaffairs.gov.au.
- Keep response under 400 words, structured with short paragraphs or bullet points.
- Mention that this is an estimate only.`;

export function buildExplainUserPrompt(ctx: ExplainContext): string {
  return `Rules version: ${ctx.rulesVersion}
Visa subclass: ${ctx.visaSubclass}
FIXED total points: ${ctx.total}
Tier: ${ctx.tier} — ${ctx.tierMessage}

Breakdown (do not change these numbers):
${JSON.stringify(ctx.breakdown, null, 2)}

Indicative pathway suggestions (already calculated by our engine; explain only, do not recalculate):
${ctx.suggestions.length > 0 ? JSON.stringify(ctx.suggestions) : "None — client may already meet competitive target."}
${ctx.gap > 0 ? `\nGap to indicative target: ${ctx.gap} points.` : ""}

Explain this assessment for an agent to share with their client.`;
}
