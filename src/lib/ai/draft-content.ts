import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ExplainContext } from "@/lib/ai/types";
import { canUseAi } from "@/lib/ai/limits";
import { openAiComplete } from "@/lib/ai/providers/openai";
import {
  buildDraftNoteUserPrompt,
  buildEmailIntroUserPrompt,
  DRAFT_NOTE_SYSTEM_PROMPT,
  EMAIL_INTRO_SYSTEM_PROMPT,
} from "@/lib/ai/prompts/draft-content";

export type DraftMode = "agent-note" | "email-intro";

export type DraftContentResult =
  | { ok: true; text: string; model: string }
  | { ok: false; error: string; code?: "not_configured" | "rate_limited" | "disabled" };

function resolveModel(preferred?: string | null): string {
  return preferred ?? process.env.AI_MODEL_DEFAULT ?? "gpt-4o-mini";
}

export async function generateDraftContent(params: {
  organizationId: string;
  profileId: string;
  mode: DraftMode;
  explainContext?: ExplainContext;
  emailIntro?: {
    clientName: string;
    total: number;
    visaSubclass: string;
    gap: number;
    suggestions: { label: string; delta: number }[];
  };
  rulesVersion: string;
}): Promise<DraftContentResult> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Server not configured" };

  const { data: org } = await admin
    .from("organizations")
    .select("plan, ai_enabled, preferred_model")
    .eq("id", params.organizationId)
    .single();

  if (!org) return { ok: false, error: "Organization not found" };

  const gate = await canUseAi(params.organizationId, org.plan, org.ai_enabled);
  const task = params.mode === "email-intro" ? "draft-note" : "draft-note";

  if (!gate.allowed) {
    await admin.from("ai_requests").insert({
      organization_id: params.organizationId,
      profile_id: params.profileId,
      task,
      model: resolveModel(org.preferred_model),
      rules_version: params.rulesVersion,
      status: "rate_limited",
      error_message: gate.reason,
    });
    return { ok: false, error: gate.reason ?? "Not allowed", code: "rate_limited" };
  }

  const system =
    params.mode === "email-intro" ? EMAIL_INTRO_SYSTEM_PROMPT : DRAFT_NOTE_SYSTEM_PROMPT;
  const user =
    params.mode === "email-intro" && params.emailIntro
      ? buildEmailIntroUserPrompt(params.emailIntro)
      : params.explainContext
        ? buildDraftNoteUserPrompt(params.explainContext)
        : "";

  if (!user) return { ok: false, error: "Missing context" };

  const model = resolveModel(org.preferred_model);
  const promptHash = createHash("sha256").update(user).digest("hex").slice(0, 16);

  try {
    const { text, tokensIn, tokensOut } = await openAiComplete({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    await admin.from("ai_requests").insert({
      organization_id: params.organizationId,
      profile_id: params.profileId,
      task,
      model,
      rules_version: params.rulesVersion,
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
      task,
      model,
      rules_version: params.rulesVersion,
      prompt_hash: promptHash,
      status: "error",
      error_message: message,
    });
    if (message.includes("OPENAI_API_KEY")) {
      return { ok: false, error: "AI is not configured on this server.", code: "not_configured" };
    }
    return { ok: false, error: message };
  }
}
