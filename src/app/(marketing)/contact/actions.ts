"use server";

import { getResend } from "@/lib/email/resend";

export async function submitContactForm(formData: FormData): Promise<{ error?: string; ok?: boolean }> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) return { error: "All fields are required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email address" };

  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  const from = process.env.EMAIL_FROM_PLATFORM ?? "onboarding@resend.dev";
  const resend = getResend();

  if (!resend || !supportEmail) {
    return { error: "Contact form is not configured. Email support directly." };
  }

  const { error } = await resend.emails.send({
    from,
    to: supportEmail,
    replyTo: email,
    subject: `Contact: ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
  });

  if (error) return { error: error.message };
  return { ok: true };
}
