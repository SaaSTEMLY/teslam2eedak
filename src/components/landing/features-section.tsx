"use client";

import {
  QrCode,
  Bike,
  SlidersHorizontal,
  CreditCard,
  Languages,
  Clock,
} from "lucide-react";
import {
  AnimateOnScroll,
  StaggerContainer,
} from "@/components/ui/animate-on-scroll";
import type { Messages } from "@/lib/i18n";

export function FeaturesSection({
  messages: m,
}: {
  messages: Messages<"home">;
}) {
  const features = [
    {
      icon: QrCode,
      title: m.featureEcommerceTitle,
      description: m.featureEcommerceDesc,
    },
    {
      icon: Bike,
      title: m.featureAdminTitle,
      description: m.featureAdminDesc,
    },
    {
      icon: SlidersHorizontal,
      title: m.featureAuthTitle,
      description: m.featureAuthDesc,
    },
    {
      icon: CreditCard,
      title: m.featurePaymentsTitle,
      description: m.featurePaymentsDesc,
    },
    {
      icon: Languages,
      title: m.featureI18nTitle,
      description: m.featureI18nDesc,
    },
    {
      icon: Clock,
      title: m.featureSeoTitle,
      description: m.featureSeoDesc,
    },
  ];

  return (
    <section id="features" className="py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.featuresTitle}
            <br />
            <span className="text-muted-foreground/40">
              {m.featuresTitleFaded}
            </span>
          </h2>
        </AnimateOnScroll>

        <StaggerContainer
          className="mt-16 grid grid-cols-1 gap-y-10 sm:mt-20 sm:grid-cols-2 sm:gap-x-16 sm:gap-y-14 lg:grid-cols-3"
          staggerDelay={0.08}
        >
          {features.map((feature) => (
            <div key={feature.title} className="group">
              <feature.icon className="mb-4 size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
