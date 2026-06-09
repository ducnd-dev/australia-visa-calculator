import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExplainContext, ExplainResult } from "@/lib/ai/types";
import { canUseAi } from "@/lib/ai/limits";
import { openAiComplete } from "@/lib/ai/providers/openai";
import { buildExplainUserPrompt, EXPLAIN_SYSTEM_PROMPT } from "@/lib/ai/prompts/explain-breakdown";

function resolveModel(preferred?: string | null): string {
  return preferred ?? process.env.AI_MODEL_DEFAULT ?? "gpt-4o-mini";
}

export async function explainAssessment(params: {
  organizationId: string;
  profileId: string;
  context: ExplainContext;
}): Promise<ExplainResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Server not configured" };

  const { data: org } = await admin
    .from("organizations")
    .select("plan, ai_enabled, preferred_model")
    .eq("id", params.organizationId)
    .single();

  if (!org) return { ok: false, error: "Organization not found" };

  const gate = await canUseAi(params.organizationId, org.plan, org.ai_enabled);
  if (!gate.allowed) {
    await admin.from("ai_requests").insert({
      organization_id: params.organizationId,
      profile_id: params.profileId,
      task: "explain",
      model: resolveModel(org.preferred_model),
      rules_version: params.context.rulesVersion,
      status: "rate_limited",
      error_message: gate.reason,
    });
    return { ok: false, error: gate.reason ?? "Not allowed", code: "rate_limited" };
  }

  const model = resolveModel(org.preferred_model);
  const userPrompt = buildExplainUserPrompt(params.context);
  const promptHash = createHash("sha256").update(userPrompt).digest("hex").slice(0, 16);

  try {
    const { text, tokensIn, tokensOut } = await openAiComplete({
      model,
      messages: [
        { role: "system", content: EXPLAIN_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    await admin.from("ai_requests").insert({
      organization_id: params.organizationId,
      profile_id: params.profileId,
      task: "explain",
      model,
      rules_version: params.context.rulesVersion,
      prompt_hash: promptHash,
      tokens_in: tokensIn ?? null,
      tokens_out: tokensOut ?? null,
      status: "ok",
    });

    return { ok: true, text, model };
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI request failed";
    await admin.from("ai_requests").insert({
      organization_id: params.organizationId,
      profile_id: params.profileId,
      task: "explain",
      model,
      rules_version: params.context.rulesVersion,
      prompt_hash: promptHash,
      status: "error",
      error_message: message,
    });
    if (message.includes("OPENAI_API_KEY")) {
      return { ok: false, error: message, code: "not_configured" };
    }
    return { ok: false, error: message };
  }
}

export function toExplainContext(input: {
  result: {
    total: number;
    visaSubclass: string;
    tier: string;
    tierMessage: string;
    breakdown: { category: string; points: number; note?: string; citation?: string }[];
  };
  suggestions: { label: string; delta: number; effort: string }[];
  gap: number;
  targetPoints?: number;
  rulesVersion: string;
}): ExplainContext {
  return {
    total: input.result.total,
    visaSubclass: input.result.visaSubclass,
    tier: input.result.tier,
    tierMessage: input.result.tierMessage,
    breakdown: input.result.breakdown,
    suggestions: input.suggestions,
    gap: input.gap,
    targetPoints: input.targetPoints,
    rulesVersion: input.rulesVersion,
  };
}
