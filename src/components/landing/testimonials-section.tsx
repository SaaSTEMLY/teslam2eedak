"use client";

import { cn } from "@/lib/utils";
import {
  AnimateOnScroll,
  StaggerContainer,
} from "@/components/ui/animate-on-scroll";
import type { Messages } from "@/lib/i18n";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  "bg-primary/10 text-primary",
  "bg-chart-2/10 text-chart-2",
  "bg-chart-4/10 text-chart-4",
];

export function TestimonialsSection({
  messages: m,
}: {
  messages: Messages<"home">;
}) {
  const testimonials = [
    {
      quote: m.testimonial1Quote,
      name: m.testimonial1Name,
      title: m.testimonial1Title,
    },
    {
      quote: m.testimonial2Quote,
      name: m.testimonial2Name,
      title: m.testimonial2Title,
    },
    {
      quote: m.testimonial3Quote,
      name: m.testimonial3Name,
      title: m.testimonial3Title,
    },
  ];

  return (
    <section className="border-y border-border/40 py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.testimonialsTitle}
            <br />
            <span className="text-muted-foreground/40">
              {m.testimonialsTitleFaded}
            </span>
          </h2>
        </AnimateOnScroll>

        <StaggerContainer
          className="mt-16 grid grid-cols-1 gap-6 sm:mt-20 md:grid-cols-3 md:gap-8"
          staggerDelay={0.1}
        >
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card/50 p-6 transition-colors hover:border-primary/30"
            >
              {/* Decorative quote mark */}
              <span
                className="mb-2 block font-serif text-4xl leading-none text-primary/20"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <p className="text-base leading-relaxed text-foreground">
                {t.quote}
              </p>

              <footer className="mt-6 flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    avatarColors[i % avatarColors.length],
                  )}
                >
                  {getInitials(t.name)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
