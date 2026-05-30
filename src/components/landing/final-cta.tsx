"use client";

import Link from "@/components/Link/customLink";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import type { Messages } from "@/lib/i18n";

interface FinalCtaProps {
  messages: Messages<"home">;
  footerMessages?: Messages<"footer">;
}

export function FinalCta({ messages: m, footerMessages }: FinalCtaProps) {
  return (
    <section className="py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <AnimateOnScroll>
          <h2 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.ctaTitle}
            <br />
            <span className="text-muted-foreground/40">{m.ctaTitleFaded}</span>
          </h2>
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.15}>
          <div className="mt-10">
            <Button
              size="lg"
              className="group h-14 rounded-xl px-10 text-base font-semibold"
              asChild
            >
              <Link href="/menu">
                {m.ctaButton}
                <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              {m.ctaGuarantee}
            </p>
          </div>
        </AnimateOnScroll>

        {footerMessages && (
          <AnimateOnScroll delay={0.25}>
            <div className="mt-12 mx-auto max-w-md">
              <p className="text-sm text-muted-foreground mb-3">
                {m.ctaNewsletterLabel}
              </p>
              <NewsletterForm translations={footerMessages} />
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}
