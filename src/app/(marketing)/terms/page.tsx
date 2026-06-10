import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description: "Terms for using the public calculator and practice workspace.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms of Service"
      description="Terms for applicants using the public site and migration agents using the workspace. Last updated: June 2026."
    >
      <h2>Agreement</h2>
      <p>
        By accessing Australia Visa Points Calculator you agree to these terms and our{" "}
        <Link href="/privacy">privacy policy</Link>. If you do not agree, do not use the service.
      </p>

      <h2>Service description</h2>
      <p>
        We provide a Schedule 6D points <strong>estimator</strong> for subclasses 189, 190, and 491,
        plus optional practice workspace tools for client management and communication. The service does not
        provide migration advice — see <Link href="/disclaimer">disclaimer</Link>.
      </p>

      <h2>Accounts and workspaces</h2>
      <ul>
        <li>You must provide accurate registration information</li>
        <li>You are responsible for safeguarding login credentials and activity under your workspace</li>
        <li>Workspace admins manage billing, settings, and who may use the organisation account</li>
        <li>
          Migration practices are responsible for the accuracy of client data they store and for lawful basis to
          process client personal information
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use the service for unlawful, misleading, or harmful purposes</li>
        <li>Do not misrepresent calculator output as official Department of Home Affairs advice</li>
        <li>Do not send spam or unsolicited marketing without consent (Australian Spam Act 2003)</li>
        <li>Do not attempt to disrupt, scrape, or reverse engineer the service in bad faith</li>
        <li>Do not upload unlawful content or infringe third-party rights</li>
      </ul>

      <h2>Practice email and client consent</h2>
      <p>
        If you send marketing email to clients through this platform, you confirm you have appropriate
        consent or another lawful basis. Assessment report emails are transactional communications
        related to services you provide. Clients may unsubscribe from marketing as described in the
        product.
      </p>

      <h2>Paid plans</h2>
      <p>
        Professional plan subscriptions bill through Stripe on a recurring basis until cancelled in the billing
        portal. Fees are shown at checkout. Refunds are at our discretion except where required by
        Australian Consumer Law. Feature limits (email volume, AI usage) apply per plan as described
        on <Link href="/pricing">pricing</Link>.
      </p>

      <h2>Intellectual property</h2>
      <p>
        We own the website, software, branding, and documentation. You retain ownership of data you
        input. You grant us a licence to host, process, and transmit your data solely to operate the
        service.
      </p>

      <h2>Availability</h2>
      <p>
        We aim for reliable uptime but do not guarantee uninterrupted access. Maintenance, third-party
        outages, or policy updates may affect availability.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        The service is provided &quot;as is&quot; to the maximum extent permitted by law. We are not
        liable for indirect or consequential loss arising from reliance on estimates, invitation
        outcomes, or downtime. Nothing in these terms excludes rights you cannot waive under the
        Australian Consumer Law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Australia. Disputes are subject to the courts of our
        principal place of business unless mandatory consumer protections require otherwise.
      </p>

      <p>
        Questions: <Link href="/contact">contact</Link>
      </p>
    </StaticPage>
  );
}
