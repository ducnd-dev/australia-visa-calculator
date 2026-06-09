import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How Australia Visa Points Calculator collects, uses, and stores data for public users and agency workspaces.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy Policy"
      description="How we handle information on the public site and in agency workspaces. Last updated: June 2026."
    >
      <h2>Who we are</h2>
      <p>
        Australia Visa Points Calculator (&quot;we&quot;, &quot;us&quot;) operates a public website
        and optional agency workspace for Schedule 6D points estimates. Contact details are on our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <h2>Information we collect</h2>
      <h3>Public calculator and results</h3>
      <ul>
        <li>Answers you enter to run the points test (processed to display results)</li>
        <li>
          Shareable results URLs that encode your answers — anyone with the link can view that summary
        </li>
        <li>
          Basic usage analytics if enabled (e.g. Google Analytics), subject to the provider&apos;s
          policy and your browser settings
        </li>
      </ul>
      <h3>Agency accounts</h3>
      <ul>
        <li>Account email, name, and organisation details</li>
        <li>Client profiles you create: display name, email, notes, marketing consent, assessments</li>
        <li>Subscription and billing metadata via our payment provider (we do not store full card numbers)</li>
        <li>Email delivery logs when you send assessment reports or campaigns</li>
        <li>AI usage metadata when you generate explanations (assessment context, not intended for unrelated profiling)</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Operate the calculator, agency workspace, billing, and email features</li>
        <li>Improve reliability and security of the service</li>
        <li>Send transactional messages you request (e.g. assessment reports)</li>
        <li>
          Send marketing email only where permitted — agencies must have client consent; agents may
          opt in to product updates
        </li>
        <li>Comply with law and respond to abuse or support requests</li>
      </ul>

      <h2>Service providers</h2>
      <p>
        We use trusted processors to host and operate the service, including providers for
        authentication, database hosting, payments, email delivery, and (where enabled) AI
        explanations. Data may be stored or processed outside Australia depending on the provider.
        We choose processors with appropriate security practices; review their privacy policies for
        details.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Agency data is kept while your workspace remains active. You may request deletion of personal
        information via <Link href="/contact">contact</Link>. We may retain minimal logs required for
        security, billing disputes, or legal obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        Under the Australian Privacy Act 1988 and applicable law, you may request access to, correction
        of, or deletion of personal information we hold about you, subject to exceptions. Agency
        admins should handle client data requests in line with their own privacy obligations to
        clients.
      </p>

      <h2>Spam Act and marketing</h2>
      <p>
        Agencies must have appropriate consent before sending marketing email to clients through this
        platform. We provide unsubscribe mechanisms. See <Link href="/terms">terms</Link>.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        We may use cookies or similar technologies for essential site function and analytics. You can
        control cookies through your browser settings.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy. Material changes will be reflected on this page with an updated
        date. Continued use after changes constitutes acceptance of the revised policy.
      </p>
    </StaticPage>
  );
}
