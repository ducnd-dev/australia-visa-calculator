import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { PageIntro } from "@/components/layout/PageIntro";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Agent sign in",
  description: "Sign in to the agency dashboard.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-12">
      <PageIntro
        eyebrow="Agency portal"
        title="Sign in to your workspace"
        description="Manage clients, run assessments, and send reports from one dashboard."
      />
      <AuthForm />
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account needed?{" "}
        <Link href="/calculator" className="font-medium text-primary hover:underline">
          Use the public calculator
        </Link>
      </p>
    </div>
  );
}
