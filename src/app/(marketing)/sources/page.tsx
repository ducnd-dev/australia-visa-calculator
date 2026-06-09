import Link from "next/link";
import { StaticPage } from "@/components/layout/StaticPage";
import { buildMetadata } from "@/lib/seo";
import { LAST_UPDATED, OFFICIAL_SOURCES, RULES_VERSION } from "@/lib/visa-rules/sources";

const TIER_LABELS: Record<string, string> = {
  legislation: "Legislation",
  dha: "Department of Home Affairs",
  instrument: "Legislative instrument",
  reference: "Reference",
};

export const metadata = buildMetadata({
  title: "Official Sources — Schedule 6D Points",
  description:
    "Legislation and Department of Home Affairs references used for Australian skilled migration points calculations.",
  path: "/sources",
});

export default function SourcesPage() {
  return (
    <StaticPage
      title="Official sources"
      description="Primary references for Schedule 6D skilled migration points (subclasses 189, 190, 491)."
    >
      <p>
        Our calculator implements <strong>Schedule 6D</strong> of the Migration Regulations 1994.
        Implementation version <code>{RULES_VERSION}</code>, last reviewed {LAST_UPDATED}. This page
        lists the main authorities we align to — not an exhaustive legal bibliography.
      </p>

      <h2>Primary references</h2>
      <ul>
        {OFFICIAL_SOURCES.map((s) => (
          <li key={s.id} className="mb-4">
            <a
              href={s.url}
              rel="noopener noreferrer"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              {s.title}
            </a>
            <span className="block text-sm text-muted-foreground">
              {TIER_LABELS[s.tier] ?? s.tier} · applies to subclasses {s.appliesTo.join(", ")}
            </span>
          </li>
        ))}
      </ul>

      <h2>What Schedule 6D does not cover</h2>
      <p>
        Points are only one part of GSM eligibility. Separate sources govern skilled occupation lists,
        skills assessments, English test validity, health and character, age at invitation, and state
        nomination requirements. Use the{" "}
        <Link href="/visas">visa directory</Link> for subclass overviews and Home Affairs for
        authoritative criteria.
      </p>

      <h2>Before you lodge</h2>
      <p>
        Law and policy change without notice. Invitation points thresholds in SkillSelect vary by
        round, visa subclass, and occupation. Always confirm current requirements on{" "}
        <a
          href="https://immi.homeaffairs.gov.au"
          rel="noopener noreferrer"
          target="_blank"
          className="font-medium text-primary hover:underline"
        >
          immi.homeaffairs.gov.au
        </a>{" "}
        and with a registered migration agent before lodging an Expression of Interest or visa
        application.
      </p>
    </StaticPage>
  );
}
