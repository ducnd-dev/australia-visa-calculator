"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import {
  hashSharePassword,
  shareUnlockCookieName,
  verifySharePassword,
} from "@/lib/share/share-password";

export async function verifySharePasswordAction(
  token: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Not configured" };

  const { data } = await admin
    .from("assessments")
    .select("share_password_hash, share_revoked_at, share_expires_at")
    .eq("share_token", token)
    .single();

  if (!data?.share_password_hash) {
    return { ok: true };
  }

  const valid = await verifySharePassword(password, data.share_password_hash);
  if (!valid) return { ok: false, error: "Incorrect password" };

  const jar = await cookies();
  jar.set(shareUnlockCookieName(token), "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: `/share/${token}`,
  });

  return { ok: true };
}

export async function setSharePasswordAction(
  assessmentId: string,
  clientId: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireProfile();
  if (!profile) return { ok: false, error: "Not signed in" };

  if (password.length < 4) {
    return { ok: false, error: "Password must be at least 4 characters" };
  }

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id")
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) return { ok: false, error: "Assessment not found" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Not configured" };

  const hashValue = await hashSharePassword(password);
  const { error } = await admin
    .from("assessments")
    .update({ share_password_hash: hashValue })
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/app/clients/${clientId}`);
  revalidatePath(`/app/assessments/${assessmentId}`);
  return { ok: true };
}

export async function clearSharePasswordAction(
  assessmentId: string,
  clientId?: string
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireProfile();
  if (!profile) return { ok: false, error: "Not signed in" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Not configured" };

  const { data: assessment } = await supabase
    .from("assessments")
    .select("id, client_id")
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id)
    .single();

  if (!assessment) return { ok: false, error: "Assessment not found" };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Not configured" };

  const { error } = await admin
    .from("assessments")
    .update({ share_password_hash: null })
    .eq("id", assessmentId)
    .eq("organization_id", profile.organization_id);

  if (error) return { ok: false, error: error.message };
  const cid = clientId ?? assessment.client_id;
  if (cid) revalidatePath(`/app/clients/${cid}`);
  revalidatePath(`/app/assessments/${assessmentId}`);
  return { ok: true };
}
