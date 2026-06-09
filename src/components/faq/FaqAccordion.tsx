"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion className="not-prose rounded-2xl border border-border/80 bg-card px-4 shadow-sm">
      {items.map((f, i) => (
        <AccordionItem key={f.question} value={`faq-${i}`}>
          <AccordionTrigger className="py-4 text-base font-semibold text-foreground hover:no-underline">
            {f.question}
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
            {f.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FaqFooterLinks() {
  return (
    <p className="not-prose mt-10 text-sm text-muted-foreground">
      More detail in our{" "}
      <Link href="/blog" className="font-medium text-primary hover:underline">
        guides
      </Link>{" "}
      or{" "}
      <Link href="/for-agents" className="font-medium text-primary hover:underline">
        agent overview
      </Link>
      .
    </p>
  );
}
