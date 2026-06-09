import { FaqAccordion, FaqFooterLinks } from "@/components/faq/FaqAccordion";
import { StaticPage } from "@/components/layout/StaticPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { SITE_FAQS } from "@/lib/static-content/faqs";

export const metadata = buildMetadata({
  title: "FAQ — Australian Visa Points Calculator",
  description:
    "Frequently asked questions about Schedule 6D points, subclasses 189/190/491, agency features, share links, and disclaimers.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd(SITE_FAQS)} />
      <StaticPage
        title="Frequently asked questions"
        description="Points tests, pathways, agency workspace, and important limitations."
        cta={{ label: "Calculate your points", href: "/calculator" }}
      >
        <FaqAccordion items={SITE_FAQS} />
        <FaqFooterLinks />
      </StaticPage>
    </>
  );
}
