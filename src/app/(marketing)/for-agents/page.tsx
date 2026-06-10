import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { AGENCY_PLAN_FEATURES, TRIAL_PLAN_FEATURES } from "@/lib/static-content/plans";

export const metadata = buildMetadata({
  title: "For Migration Agents — Client Points Assessments",
  description:
    "Schedule 6D calculator for agencies: client files, saved assessments, branded share links, PDF export, email reports, and AI explanations.",
  path: "/for-agents",
  keywords: ["migration agent points calculator", "Schedule 6D software agents"],
});

export default function ForAgentsPage() {
  return (
    <StaticPage
      title="Built for migration agents"
      description="From first consultation to client follow-up — accurate Schedule 6D assessments with professional outputs."
      cta={{ label: "Start agency trial", href: "/login" }}
    >
      <h2>A typical workflow</h2>
      <ol>
        <li>
          <strong>Intake</strong> — create a client profile (name, email, notes, marketing consent).
        </li>
        <li>
          <strong>Assess</strong> — run the same Schedule 6D wizard used on the public calculator;
          scores for 189, 190, and 491 are saved to the client file.
        </li>
        <li>
          <strong>Advise</strong> — review the line-by-line breakdown, gap-to-target suggestions, and
          optional AI plain-English summary (points are never recalculated by AI).
        </li>
        <li>
          <strong>Deliver</strong> — send a share link, email an assessment report, or export a PDF on
          the Agency plan.
        </li>
        <li>
          <strong>Follow up</strong> — re-run assessments when English scores or nomination options
          change; use consented marketing campaigns for check-ins.
        </li>
      </ol>

      <h2>Why agents use this tool</h2>
      <ul>
        <li>Deterministic Schedule 6D engine with citation-style breakdown lines</li>
        <li>Client workspace: profiles, ANZSCO occupation, search and archive, assessment history</li>
        <li>Team workspace: invite agents, shared clients, role-based access (admin vs agent)</li>
        <li>Compare two saved assessments to show point progress to clients</li>
        <li>Pathway and improvement suggestions based on rule simulations — not AI math</li>
        <li>Share links for clients; branded logo on share pages with Agency plan</li>
        <li>Transactional assessment emails plus optional marketing campaigns (with consent)</li>
      </ul>

      <h2>Trial workspace</h2>
      <ul>
        {TRIAL_PLAN_FEATURES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <h2>Agency plan (paid)</h2>
      <ul>
        {AGENCY_PLAN_FEATURES.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p>
        Compare plans on <Link href="/pricing">pricing</Link> or upgrade from{" "}
        <strong>Billing</strong> inside the app.
      </p>

      <h2>Your professional responsibilities</h2>
      <p>
        You remain responsible for immigration assistance you provide to clients. This tool supplies
        estimates and document templates — not a substitute for your judgment, skills assessments,
        or current Home Affairs policy. Obtain client consent before marketing email. Read our{" "}
        <Link href="/disclaimer">disclaimer</Link> and <Link href="/terms">terms</Link>.
      </p>

      <h2>Get started</h2>
      <ol>
        <li>
          <Link href="/login">Create an agency account</Link> (trial — no card required to explore).
        </li>
        <li>Add your first client and run an assessment from the dashboard.</li>
        <li>Share results or email a report; upgrade when you need PDF and branding.</li>
      </ol>
    </StaticPage>
  );
}
