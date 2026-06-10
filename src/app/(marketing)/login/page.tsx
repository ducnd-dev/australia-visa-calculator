import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { getInviteByToken } from "@/app/(app)/app/settings/team-actions";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Agent sign in",
  description: "Sign in to your migration practice workspace.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const { invite: inviteToken } = await searchParams;
  const inviteDetails = inviteToken ? await getInviteByToken(inviteToken) : null;
  const invite = inviteDetails
    ? { token: inviteToken!, ...inviteDetails }
    : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <PageIntro
        eyebrow="Practice portal"
        title={invite ? `Join ${invite.orgName}` : "Sign in to your workspace"}
        description={
          invite
            ? "Accept your team invitation to access the shared practice workspace."
            : "Manage clients, run assessments, and send reports from one dashboard."
        }
      />
      <AuthForm invite={invite} />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account needed?{" "}
        <Link href="/calculator" className="font-medium text-primary hover:underline">
          Use the public calculator
        </Link>
      </p>
    </div>
  );
}
