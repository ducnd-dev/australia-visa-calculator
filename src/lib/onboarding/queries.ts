import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildOnboardingSteps, type OnboardingState } from "./steps";

export async function getOnboardingState(organizationId: string): Promise<OnboardingState> {
  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    return buildOnboardingSteps({
      hasProfile: false,
      clientCount: 0,
      assessmentCount: 0,
      hasDelivered: false,
      dismissed: false,
    });
  }

  const [
    { data: org },
    { count: clientCount },
    { count: assessmentCount },
    { count: emailCount },
    { count: sharedCount },
    { data: onboarding },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("mara_number, phone, website, registered_business_name")
      .eq("id", organizationId)
      .single(),
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("is_example", false),
    supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    supabase
      .from("email_sends")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "sent"),
    supabase
      .from("assessments")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .not("share_token", "is", null)
      .is("share_revoked_at", null),
    supabase
      .from("organization_onboarding")
      .select("dismissed_at")
      .eq("organization_id", organizationId)
      .maybeSingle(),
  ]);

  const hasProfile = Boolean(
    org?.mara_number?.trim() ||
      org?.phone?.trim() ||
      org?.website?.trim() ||
      org?.registered_business_name?.trim()
  );

  return buildOnboardingSteps({
    hasProfile,
    clientCount: clientCount ?? 0,
    assessmentCount: assessmentCount ?? 0,
    hasDelivered: (emailCount ?? 0) > 0 || (sharedCount ?? 0) > 0,
    dismissed: Boolean(onboarding?.dismissed_at),
  });
}
