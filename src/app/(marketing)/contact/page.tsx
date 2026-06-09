import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
const HAS_SUPPORT_EMAIL = SUPPORT_EMAIL && !SUPPORT_EMAIL.includes("example.com");

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Australia Visa Points Calculator for product support, billing questions, and privacy requests.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      description="Product support, billing questions, and privacy requests."
    >
      <h2>Send a message</h2>
      <p>
        Use the form below for general enquiries. We aim to respond within a few business days.
      </p>
      <ContactForm />

      {HAS_SUPPORT_EMAIL ? (
        <>
          <h2>Email</h2>
          <p>
            You can also write to us at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary hover:underline">
              {SUPPORT_EMAIL}
            </a>
            . Include your workspace name if you are an agency user.
          </p>
        </>
      ) : null}

      <h2>Migration agents</h2>
      <p>
        Signed-in agencies can manage billing, branding, email sender settings, and AI preferences in
        the app under <strong>Settings</strong> and <strong>Billing</strong>. For subscription or
        invoice issues, mention your organisation name and the email on the account.
      </p>

      <h2>Applicants using the public calculator</h2>
      <p>
        We do not provide individual migration advice or case assessments by email. Use the free{" "}
        <Link href="/calculator">points calculator</Link> and consult a{" "}
        <a
          href="https://www.mara.gov.au/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          registered migration agent
        </a>{" "}
        for advice tailored to your circumstances.
      </p>

      <h2>Privacy requests</h2>
      <p>
        To request access, correction, or deletion of personal data in an agency workspace, contact us
        with the subject line <strong>Privacy request</strong> and the email address on the account.
        See our <Link href="/privacy">privacy policy</Link> for details.
      </p>

      <h2>Unsubscribe</h2>
      <p>
        Marketing emails include an unsubscribe link. Clients who received email from your agency via
        this platform can also use the unsubscribe link in that message to stop marketing from your
        workspace.
      </p>
    </StaticPage>
  );
}
