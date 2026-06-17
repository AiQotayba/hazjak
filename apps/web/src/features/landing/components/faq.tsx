"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "./section";
import { landingFaqs } from "../data/faq-data";

export function LandingFaq({ compact = false }: { compact?: boolean }) {
  return (
    <Section id="faq" className={compact ? "py-10 md:py-14" : undefined}>
      <SectionHeading title="أسئلة شائعة" centered />
      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="rounded-3xl bg-card shadow-soft px-4 md:px-6"
      >
        {landingFaqs.map((faq, i) => (
          <AccordionItem key={faq.question} value={`item-${i}`}>
            <AccordionTrigger className="text-heading font-bold hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
