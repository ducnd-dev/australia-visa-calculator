"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth/session";

export async function updateAgentNotes(assessmentId: string, notes: string): Promise<void> {
  const profile = await getSessionProfile();
  const supabase = await createClient();
  if (!profile || !supabase) return;

  await supabase
    .from("assessments")
    .update({ agent_notes: notes.trim() || null })
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id);

  revalidatePath(`/app/assessments/${assessmentId}`);
}
