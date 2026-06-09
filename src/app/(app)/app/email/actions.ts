"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { sendAssessmentReportEmail } from "@/lib/email/send-assessment-report";

export async function sendAssessmentReport(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");

  const assessmentId = String(formData.get("assessmentId") ?? "");
  const clientId = String(formData.get("clientId") ?? "");
  if (!assessmentId || !clientId) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent("Missing assessment")}`);
  }

  const result = await sendAssessmentReportEmail({
    organizationId: profile.organization_id,
    assessmentId,
    clientId,
    createdBy: profile.id,
  });

  revalidatePath(`/app/clients/${clientId}`);

  if (!result.ok) {
    redirect(`/app/clients/${clientId}?emailError=${encodeURIComponent(result.error)}`);
  }

  redirect(`/app/clients/${clientId}?emailSent=1`);
}
