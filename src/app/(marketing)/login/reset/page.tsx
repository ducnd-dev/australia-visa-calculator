import Link from "next/link";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Reset password",
  description: "Request a password reset link for your practice account.",
  path: "/login/reset",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PasswordResetForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
