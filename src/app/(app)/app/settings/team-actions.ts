"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getResend } from "@/lib/email/resend";
import { teamInviteHtml, teamInviteSubject } from "@/lib/email/templates/team-invite";
import { requireProfile } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/stripe/client";
import { findAuthUserByEmail } from "@/lib/team/find-auth-user-by-email";
import {
  generateInviteToken,
  inviteExpiresAt,
  isInviteValid,
  normalizeInviteEmail,
  validateInviteAccept,
} from "@/lib/team/invites";

function teamErrorRedirect(message: string): never {
  redirect(`/app/settings?error=${encodeURIComponent(message)}`);
}

export async function inviteMember(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") teamErrorRedirect("Only admins can invite team members");

  const email = normalizeInviteEmail(String(formData.get("email") ?? ""));
  const role = String(formData.get("role") ?? "agent");
  if (!email) teamErrorRedirect("Email is required");
  if (role !== "admin" && role !== "agent") teamErrorRedirect("Invalid role");

  const admin = createAdminClient();
  if (!admin) teamErrorRedirect("Not configured");

  const { data: org } = await admin
    .from("organizations")
    .select("seat_limit, name")
    .eq("id", profile.organization_id)
    .single();

  if (org?.seat_limit != null) {
    const { count } = await admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", profile.organization_id);
    if ((count ?? 0) >= org.seat_limit) {
      teamErrorRedirect(
        `Seat limit reached (${org.seat_limit}). Remove a member or contact support to add seats.`
      );
    }
  }

  const existingUser = await findAuthUserByEmail(admin, email);
  if (existingUser) {
    const { data: memberProfile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", existingUser.id)
      .maybeSingle();
    if (memberProfile && memberProfile.organization_id !== profile.organization_id) {
      teamErrorRedirect(
        "This email already belongs to another workspace. Contact support if you need to transfer access."
      );
    }
    if (memberProfile?.organization_id === profile.organization_id) {
      teamErrorRedirect("This person is already a member of your workspace");
    }
  }

  const token = generateInviteToken();
  const expiresAt = inviteExpiresAt();

  const { error } = await admin.from("organization_invites").upsert(
    {
      organization_id: profile.organization_id,
      email,
      role,
      invited_by: profile.id,
      token,
      expires_at: expiresAt,
      accepted_at: null,
    },
    { onConflict: "organization_id,email" }
  );

  if (error) teamErrorRedirect(error.message);

  const orgName = profile.organizations?.name ?? "Agency";
  const inviteUrl = `${getSiteUrl()}/login?invite=${token}`;
  const resend = getResend();
  if (resend) {
    const fromAddress =
      process.env.EMAIL_FROM_PLATFORM ?? "onboarding@resend.dev";
    await resend.emails.send({
      from: fromAddress,
      to: email,
      subject: teamInviteSubject(orgName),
      html: teamInviteHtml({
        orgName,
        inviterName: profile.full_name ?? "Your agency admin",
        role,
        inviteUrl,
      }),
    });
  }

  revalidatePath("/app/settings");
  redirect("/app/settings?teamInvited=1");
}

export async function revokeInvite(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") teamErrorRedirect("Only admins can revoke invites");

  const inviteId = String(formData.get("inviteId") ?? "");
  const admin = createAdminClient();
  if (!admin) teamErrorRedirect("Not configured");

  const { error } = await admin
    .from("organization_invites")
    .delete()
    .eq("id", inviteId)
    .eq("organization_id", profile.organization_id);

  if (error) teamErrorRedirect(error.message);
  revalidatePath("/app/settings");
  redirect("/app/settings?inviteRevoked=1");
}

export async function removeMember(formData: FormData): Promise<void> {
  const profile = await requireProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") teamErrorRedirect("Only admins can remove members");

  const memberId = String(formData.get("memberId") ?? "");
  if (memberId === profile.id) teamErrorRedirect("You cannot remove yourself");

  const admin = createAdminClient();
  if (!admin) teamErrorRedirect("Not configured");

  const { data: member } = await admin
    .from("profiles")
    .select("id, organization_id, role")
    .eq("id", memberId)
    .single();

  if (!member || member.organization_id !== profile.organization_id) {
    teamErrorRedirect("Member not found");
  }

  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", profile.organization_id)
    .eq("role", "admin");

  if (member.role === "admin" && (count ?? 0) <= 1) {
    teamErrorRedirect("Cannot remove the last admin");
  }

  const { error } = await admin.from("profiles").delete().eq("id", memberId);
  if (error) teamErrorRedirect(error.message);

  revalidatePath("/app/settings");
  redirect("/app/settings?memberRemoved=1");
}

export async function acceptInvite(token: string, userId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  if (!admin) return { error: "Not configured" };

  const { data: invite } = await admin
    .from("organization_invites")
    .select("*")
    .eq("token", token)
    .single();

  const inviteValid = !!invite && isInviteValid(invite);

  const { data: existing } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", userId)
    .maybeSingle();

  const { data: authUser } = await admin.auth.admin.getUserById(userId);
  const acceptError = validateInviteAccept({
    inviteValid,
    userEmail: authUser.user?.email,
    inviteEmail: invite?.email ?? "",
    existingOrgId: existing?.organization_id,
    inviteOrgId: invite?.organization_id ?? "",
  });
  if (acceptError === "invalid" || !invite) {
    return { error: "Invitation is invalid or expired" };
  }
  if (acceptError === "cross_org") {
    return { error: "Your account already belongs to another workspace" };
  }

  if (existing) {
    const { error } = await admin
      .from("profiles")
      .update({ role: invite.role })
      .eq("id", userId);
    if (error) return { error: error.message };
  } else {
    if (acceptError === "wrong_email") {
      return { error: "Sign in with the invited email address" };
    }

    const { error } = await admin.from("profiles").insert({
      id: userId,
      organization_id: invite.organization_id,
      full_name: authUser.user?.user_metadata?.full_name ?? null,
      role: invite.role,
    });
    if (error) return { error: error.message };
  }

  await admin
    .from("organization_invites")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invite.id);

  return {};
}

export async function getInviteByToken(token: string) {
  const admin = createAdminClient();
  if (!admin) return null;

  const { data: invite } = await admin
    .from("organization_invites")
    .select("email, role, expires_at, accepted_at, organizations(name)")
    .eq("token", token)
    .single();

  if (!invite || !isInviteValid(invite)) return null;

  const org = invite.organizations as unknown as { name: string } | null;
  return {
    email: invite.email,
    role: invite.role,
    orgName: org?.name ?? "Agency",
  };
}
