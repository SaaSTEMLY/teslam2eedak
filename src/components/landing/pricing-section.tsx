"use client";

import Link from "@/components/Link/customLink";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AnimateOnScroll,
  StaggerContainer,
} from "@/components/ui/animate-on-scroll";
import type { Messages } from "@/lib/i18n";

export function PricingSection({
  messages: m,
}: {
  messages: Messages<"home">;
}) {
  const plans = [
    {
      name: m.planFrontendLiteName,
      price: 29,
      description: m.planFrontendLiteDesc,
      features: [
        m.planFrontendLiteFeature1,
        m.planFrontendLiteFeature2,
        m.planFrontendLiteFeature3,
        m.planFrontendLiteFeature4,
      ],
      cta: m.planFrontendLiteCta,
      featured: false,
    },
    {
      name: m.planFrontendProName,
      price: 99,
      description: m.planFrontendProDesc,
      features: [
        m.planFrontendProFeature1,
        m.planFrontendProFeature2,
        m.planFrontendProFeature3,
        m.planFrontendProFeature4,
      ],
      cta: m.planFrontendProCta,
      featured: false,
    },
    {
      name: m.planBackendFrontendLiteName,
      price: 199,
      description: m.planBackendFrontendLiteDesc,
      features: [
        m.planBackendFrontendLiteFeature1,
        m.planBackendFrontendLiteFeature2,
        m.planBackendFrontendLiteFeature3,
        m.planBackendFrontendLiteFeature4,
      ],
      cta: m.planBackendFrontendLiteCta,
      featured: false,
    },
    {
      name: m.planBackendFrontendProName,
      price: 299,
      description: m.planBackendFrontendProDesc,
      features: [
        m.planBackendFrontendProFeature1,
        m.planBackendFrontendProFeature2,
        m.planBackendFrontendProFeature3,
        m.planBackendFrontendProFeature4,
      ],
      cta: m.planBackendFrontendProCta,
      featured: true,
    },
  ];

  return (
    <section id="pricing" className="py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.pricingTitle}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {m.pricingSubtitle}
          </p>
        </AnimateOnScroll>

        <StaggerContainer
          className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.08}
        >
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border p-6 transition-all duration-300 hover:scale-[1.02] lg:p-8",
                plan.featured
                  ? "border-primary/30 bg-card ring-2 ring-primary/20 shadow-lg"
                  : "border-border bg-card/50 hover:border-primary/20",
              )}
            >
              {plan.featured && (
                <Badge className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 text-xs">
                  {m.pricingPopular}
                </Badge>
              )}

              <p className="text-sm font-medium text-muted-foreground">
                {plan.name}
              </p>
              <p className="mt-4 font-serif text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
                ${plan.price}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-sm text-foreground"
                  >
                    <Check className="size-4 shrink-0 text-muted-foreground" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full h-11 rounded-xl text-sm font-semibold"
                variant={plan.featured ? "default" : "outline"}
                asChild
              >
                <Link href="/menu">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
