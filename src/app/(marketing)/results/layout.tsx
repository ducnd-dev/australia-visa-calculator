import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Assessment results",
  description: "Shared visa points assessment results.",
  path: "/results",
  noIndex: true,
});

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
