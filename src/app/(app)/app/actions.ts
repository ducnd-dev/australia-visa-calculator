"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { calculatePoints } from "@/lib/visa-rules/gsm/calculate-points";
import { calculatorAnswersSchema, type CalculatorAnswers } from "@/lib/visa-rules/gsm/calculator-schema";
import { defaultTargetForVisa, suggestImprovements } from "@/lib/visa-rules/gsm/suggest-improvements";
import { sendAssessmentReportEmail } from "@/lib/email/send-assessment-report";

export async function signUpAgency(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const orgName = String(formData.get("orgName") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const platformMarketing = formData.get("platformMarketing") === "on";
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return { error: "Supabase is not configured. Add keys to .env.local" };

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Sign up failed" };

  const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  const { data: org, error: orgError } = await admin.from("organizations").insert({ name: orgName, slug }).select("id").single();
  if (orgError) return { error: orgError.message };

  const { error: profileError } = await admin.from("profiles").insert({
    id: authData.user.id,
    organization_id: org.id,
    full_name: fullName,
    role: "admin",
    platform_marketing_opt_in: platformMarketing,
  });
  if (profileError) return { error: profileError.message };

  await admin.from("organization_email_settings").upsert({
    organization_id: org.id,
    from_name: orgName,
    reply_to: email,
  });

  redirect("/app");
}

export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Email is required" };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/login/update-password`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updatePassword(formData: FormData): Promise<{ error?: string } | void> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters" };

  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  redirect("/app");
}

export async function updateClientRecord(clientId: string, formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!supabase) redirect(`/app/clients/${clientId}/edit?error=Not+configured`);

  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim() || null;
  const internalRef = String(formData.get("internalRef") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const marketingConsent = formData.get("marketingConsent") === "on";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) redirect(`/app/clients/${clientId}/edit?error=Profile+not+found`);

  const { error } = await supabase
    .from("clients")
    .update({
      display_name: displayName,
      email,
      internal_ref: internalRef,
      notes,
      marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId)
    .eq("organization_id", profile.organization_id);

  if (error) redirect(`/app/clients/${clientId}/edit?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${clientId}`);
  redirect(`/app/clients/${clientId}?saved=1`);
}

export async function createClientRecord(formData: FormData): Promise<void> {
  const supabase = await createClient();
  if (!supabase) redirect("/app/clients/new?error=Not+configured");
  const displayName = String(formData.get("displayName") ?? "");
  const email = String(formData.get("email") ?? "") || null;
  const internalRef = String(formData.get("internalRef") ?? "") || null;
  const notes = String(formData.get("notes") ?? "") || null;
  const marketingConsent = formData.get("marketingConsent") === "on";

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) redirect("/app/clients/new?error=Profile+not+found");

  const { data, error } = await supabase.from("clients").insert({
    organization_id: profile.organization_id,
    display_name: displayName,
    email,
    internal_ref: internalRef,
    notes,
    marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
  }).select("id").single();

  if (error) redirect(`/app/clients/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/app/clients");
  redirect(`/app/clients/${data.id}`);
}

export async function saveAssessment(input: {
  clientId: string;
  answers: CalculatorAnswers;
  agentNotes?: string;
  sendEmailAfterSave?: boolean;
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };
  const answers = calculatorAnswersSchema.parse(input.answers);
  const result = calculatePoints(answers);
  const suggestions = suggestImprovements(answers, result, defaultTargetForVisa(answers.visaSubclass));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { data: profile } = await supabase.from("profiles").select("organization_id").eq("id", user.id).single();
  if (!profile) return { error: "Profile not found" };

  const { data, error } = await supabase.from("assessments").insert({
    organization_id: profile.organization_id,
    client_id: input.clientId,
    created_by: user.id,
    visa_subclass: answers.visaSubclass,
    answers,
    breakdown: result.breakdown,
    total_points: result.total,
    agent_notes: input.agentNotes ?? null,
    suggestions_json: suggestions,
  }).select("id, share_token").single();

  if (error) return { error: error.message };

  let emailSent = false;
  let emailError: string | undefined;
  if (input.sendEmailAfterSave) {
    const emailResult = await sendAssessmentReportEmail({
      organizationId: profile.organization_id,
      assessmentId: data.id,
      clientId: input.clientId,
      createdBy: user.id,
    });
    if (emailResult.ok) emailSent = true;
    else emailError = emailResult.error;
  }

  revalidatePath("/app/clients");
  revalidatePath(`/app/clients/${input.clientId}`);
  return {
    success: true,
    assessmentId: data.id,
    shareToken: data.share_token,
    emailSent,
    emailError,
  };
}
