"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqClientProps {
  faqs: FaqItem[];
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
}

export function FaqClient({
  faqs,
  showHeader = true,
  title = "Questions.",
  subtitle = "Everything you need to know.",
}: FaqClientProps) {
  const midpoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midpoint);
  const rightColumn = faqs.slice(midpoint);

  return (
    <div>
      {showHeader && (
        <div className="mb-16 sm:mb-20">
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
        <Accordion type="multiple">
          {leftColumn.map((faq) => (
            <AccordionItem key={faq.id} value={`left-${faq.id}`}>
              <AccordionTrigger className="text-left hover:no-underline text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Accordion type="multiple">
          {rightColumn.map((faq) => (
            <AccordionItem key={faq.id} value={`right-${faq.id}`}>
              <AccordionTrigger className="text-left hover:no-underline text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
