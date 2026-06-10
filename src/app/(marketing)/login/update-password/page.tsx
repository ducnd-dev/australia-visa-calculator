import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Set new password",
  description: "Choose a new password for your practice account.",
  path: "/login/update-password",
  noIndex: true,
});

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <UpdatePasswordForm />
    </div>
  );
}
