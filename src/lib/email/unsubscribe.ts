import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/site-url";

export async function getOrCreateClientUnsubscribeToken(clientId: string): Promise<string> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Not configured");

  const { data: existing } = await admin
    .from("unsubscribe_tokens")
    .select("token")
    .eq("client_id", clientId)
    .limit(1)
    .maybeSingle();

  if (existing?.token) return existing.token;

  const token = randomBytes(24).toString("hex");
  await admin.from("unsubscribe_tokens").insert({ token, client_id: clientId });
  return token;
}

export async function getOrCreateProfileUnsubscribeToken(profileId: string): Promise<string> {
  const admin = createAdminClient();
  if (!admin) throw new Error("Not configured");

  const { data: existing } = await admin
    .from("unsubscribe_tokens")
    .select("token")
    .eq("profile_id", profileId)
    .limit(1)
    .maybeSingle();

  if (existing?.token) return existing.token;

  const token = randomBytes(24).toString("hex");
  await admin.from("unsubscribe_tokens").insert({ token, profile_id: profileId });
  return token;
}

export function unsubscribeUrl(token: string): string {
  return `${getSiteUrl()}/unsubscribe/${token}`;
}

export async function processUnsubscribe(token: string): Promise<{ ok: boolean; kind?: "client" | "profile" }> {
  const admin = createAdminClient();
  if (!admin) return { ok: false };

  const { data } = await admin.from("unsubscribe_tokens").select("client_id, profile_id").eq("token", token).single();
  if (!data) return { ok: false };

  if (data.client_id) {
    await admin.from("clients").update({ unsubscribed_at: new Date().toISOString() }).eq("id", data.client_id);
    return { ok: true, kind: "client" };
  }
  if (data.profile_id) {
    await admin
      .from("profiles")
      .update({ platform_unsubscribed_at: new Date().toISOString() })
      .eq("id", data.profile_id);
    return { ok: true, kind: "profile" };
  }
  return { ok: false };
}
