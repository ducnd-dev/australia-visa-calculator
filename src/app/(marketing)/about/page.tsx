import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { LAST_UPDATED, RULES_VERSION } from "@/lib/visa-rules/sources";
import { getActiveVisaCount } from "@/lib/visa-rules/visa-catalog";

export const metadata = buildMetadata({
  title: "About Australia Visa Points Calculator",
  description:
    "Schedule 6D points tool for migration agents and applicants. Subclasses 189, 190, and 491 with transparent rules and official sources.",
  path: "/about",
});

export default function AboutPage() {
  const visaCount = getActiveVisaCount();

  return (
    <StaticPage
      title="About"
      description="A Schedule 6D points calculator built for accuracy, transparency, and migration professionals."
      cta={{ label: "Try the calculator", href: "/calculator" }}
    >
      <h2>Our purpose</h2>
      <p>
        Skilled migration decisions often start with a simple question:{" "}
        <em>how many points do I have under Schedule 6D?</em> Australia Visa Points Calculator
        answers that question with a transparent, test-backed engine — then helps registered
        migration agents turn estimates into client-ready outputs.
      </p>

      <h2>Who we serve</h2>
      <ul>
        <li>
          <strong>Registered migration agents and agencies</strong> — maintain client profiles, save
          assessments, share results, email reports, and (on the Professional plan) export PDFs with your
          branding.
        </li>
        <li>
          <strong>Skilled migration applicants</strong> — use the free public calculator to
          understand age, English, employment, education, and partner points before engaging an
          agent. We do not provide case-specific advice on the public site.
        </li>
      </ul>

      <h2>How scoring works</h2>
      <p>
        Every total is produced by deterministic TypeScript logic aligned to{" "}
        <strong>Schedule 6D</strong> of the Migration Regulations — not by AI and not by manual
        spreadsheets. The engine includes rules that agents often get wrong in practice, such as the{" "}
        <strong>20-point combined cap</strong> on overseas and Australian skilled employment, and
        simultaneous display of 189 / 190 / 491 pathway scores.
      </p>
      <p>
        Rules version <code>{RULES_VERSION}</code>, last reviewed {LAST_UPDATED}. Methodology and
        references are listed on our <Link href="/sources">official sources</Link> page.
      </p>

      <h2>What else we publish</h2>
      <p>
        Beyond the calculator, we maintain a <Link href="/visas">visa directory</Link> of{" "}
        {visaCount}+ common subclasses and streams (for reference, not full eligibility advice) and
        a <Link href="/blog">guides library</Link> on English bands, employment caps, state
        nomination, and pathway comparisons.
      </p>

      <h2>What we are not</h2>
      <p>
        We are not a registered migration agent, law firm, or government service. Outputs are{" "}
        <strong>estimates only</strong> — invitation thresholds, occupation lists, skills assessments,
        and visa grants depend on Home Affairs policy and your full circumstances. Read our{" "}
        <Link href="/disclaimer">disclaimer</Link> before relying on any result.
      </p>
    </StaticPage>
  );
}
