import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { LAST_UPDATED, RULES_VERSION } from "@/lib/visa-rules/sources";

export const metadata = buildMetadata({
  title: "Disclaimer — Not Migration Advice",
  description:
    "Important limitations: estimates only, not legal advice, rules may change. Verify with Home Affairs before lodging.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <StaticPage
      title="Disclaimer"
      description="Please read before using the calculator or sharing results with clients."
    >
      <h2>Estimates only</h2>
      <p>
        Australia Visa Points Calculator produces <strong>estimates</strong> of skilled migration
        points based on Schedule 6D rules implemented in software (version {RULES_VERSION}, last
        reviewed {LAST_UPDATED}). Results depend on the accuracy of information you enter.
      </p>
      <p>
        An estimate is not a guarantee of eligibility, skills assessment outcome, state nomination,
        invitation to apply, or visa grant. Invitation rounds use competitive selection — minimum EOI
        points are not enough on their own for most occupations.
      </p>

      <h2>Not migration or legal advice</h2>
      <p>
        Nothing on this site is immigration advice, legal advice, or a recommendation to apply for a
        particular visa subclass or nomination strategy. In Australia, immigration assistance may
        only be provided by registered migration agents or exempt persons under the{" "}
        <em>Migration Act 1958</em>.
      </p>
      <p>
        Applicants should consult a registered migration agent for advice tailored to occupation,
        health, character, funds, and full visa criteria — not only points.
      </p>

      <h2>Occupation lists and policy change</h2>
      <p>
        Schedule 6D covers the points test only. Separate requirements apply to skilled occupation
        lists, age limits at time of invitation, English test validity, skills assessments, and
        state or territory nomination policies. These change frequently. Always check{" "}
        <a
          href="https://immi.homeaffairs.gov.au"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary hover:underline"
        >
          immi.homeaffairs.gov.au
        </a>{" "}
        and current legislation.
      </p>

      <h2>AI explanations (practice workspace)</h2>
      <p>
        Where enabled, AI-generated text summarises <strong>pre-calculated</strong> results. AI does
        not determine point totals and may omit nuance or contain errors. Treat AI output as draft
        client communication only — verify against the calculator breakdown and official sources
        before use.
      </p>

      <h2>Share links and client data</h2>
      <p>
        Assessment share links are accessible to anyone who has the URL. Agencies are responsible for
        how and when they share links with clients. See <Link href="/privacy">privacy</Link> and{" "}
        <Link href="/terms">terms</Link>.
      </p>

      <h2>Official sources</h2>
      <p>
        Our <Link href="/sources">sources page</Link> lists primary references. The Department of
        Home Affairs is the authority for visa requirements and SkillSelect processes.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, we are not liable for loss arising from reliance on
        this tool, including lodging decisions, missed invitations, or incorrect data entry. You are
        responsible for verifying outcomes before lodging an Expression of Interest or visa
        application.
      </p>
    </StaticPage>
  );
}
