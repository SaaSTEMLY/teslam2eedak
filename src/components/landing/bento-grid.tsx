"use client";

import { useRef, useState, useEffect } from "react";
import {
  Moon,
  Sun,
  ShoppingCart,
  Globe,
  Database,
  CreditCard,
  Gauge,
  Code2,
} from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import type { Messages } from "@/lib/i18n";

function NumberBar({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const timer = setTimeout(() => setWidth(value), delay);
          setHasAnimated(true);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
        return undefined;
      },
      { threshold: 0.1 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, value, delay]);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground tabular-nums">
          {width}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-foreground/60 to-foreground/90 transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function FeatureIcon({
  icon: Icon,
  label,
  animationClass,
}: {
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  label: string;
  animationClass?: string;
}) {
  return (
    <div className="group/icon flex flex-col items-center justify-center gap-2.5 rounded-xl border border-border/60 bg-card p-5 transition-all duration-300 hover:border-foreground/20 hover:bg-accent/30">
      <Icon
        className={`size-6 text-foreground/70 transition-colors group-hover/icon:text-foreground ${animationClass ?? ""}`}
      />
      <span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground text-center">
        {label}
      </span>
    </div>
  );
}

export function BentoGrid({ messages: m }: { messages: Messages<"home"> }) {
  return (
    <section className="py-20 sm:py-28 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <AnimateOnScroll>
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              {m.bentoTitle}
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              {m.bentoSubtitle}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
          {/* Code Preview — hero card */}
          <AnimateOnScroll className="md:col-span-7" delay={0}>
            <div className="h-full rounded-2xl border border-border/60 bg-card overflow-hidden group hover:border-foreground/15 transition-colors duration-300">
              <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <Code2 className="size-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {m.bentoCodePreview}
                </h3>
              </div>
              <div className="mx-3 mb-3 rounded-xl bg-primary/[0.07] dark:bg-primary/[0.12] p-4 sm:p-5 text-sm overflow-hidden">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Today · Sip Into Summer
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Maadi
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2">
                    <div className="min-w-0">
                      <div className="text-foreground font-semibold truncate">
                        Salted Karamel L
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        oat milk · extra shot
                      </div>
                    </div>
                    <span className="text-foreground font-bold whitespace-nowrap">
                      135 LE
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-2">
                    <div className="min-w-0">
                      <div className="text-foreground font-semibold truncate">
                        Salty Truffle Bagel
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        mustard mayo · arugula
                      </div>
                    </div>
                    <span className="text-foreground font-bold whitespace-nowrap">
                      235 LE
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-foreground font-semibold truncate">
                        Pistachio Kroissant
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        pistachio from Italy
                      </div>
                    </div>
                    <span className="text-foreground font-bold whitespace-nowrap">
                      95 LE
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    + VAT 14% · Service 12%
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                    Add to Order
                  </span>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Lighthouse Scores */}
          <AnimateOnScroll className="md:col-span-5" delay={0.06}>
            <div className="h-full rounded-2xl border border-border/60 bg-card overflow-hidden group hover:border-foreground/15 transition-colors duration-300">
              <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                <Gauge className="size-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {m.bentoLighthouse}
                </h3>
              </div>
              <div className="px-5 pb-5 space-y-3">
                <NumberBar label={m.bentoPerformance} value={98} delay={200} />
                <NumberBar
                  label={m.bentoAccessibility}
                  value={100}
                  delay={400}
                />
                <NumberBar
                  label={m.bentoBestPractices}
                  value={100}
                  delay={600}
                />
                <NumberBar label={m.bentoSeo} value={100} delay={800} />
              </div>
            </div>
          </AnimateOnScroll>

          {/* Dark Mode */}
          <AnimateOnScroll className="md:col-span-5" delay={0.12}>
            <div className="h-full rounded-2xl border border-border/60 bg-card overflow-hidden group hover:border-foreground/15 transition-colors duration-300">
              <div className="px-5 pt-5 pb-3">
                <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {m.bentoDarkMode}
                </h3>
              </div>
              <div className="px-5 pb-5 flex flex-col min-[360px]:flex-row items-stretch min-[360px]:items-center gap-3">
                <div className="flex-1 rounded-xl bg-white border border-gray-200 p-3.5 flex items-center gap-3">
                  <Sun className="size-4 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-2 w-14 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-9 bg-gray-100 rounded-full" />
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-[#1a1a2e] border border-gray-700/50 p-3.5 flex items-center gap-3">
                  <Moon className="size-4 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-2 w-14 bg-gray-700 rounded-full" />
                    <div className="h-1.5 w-9 bg-gray-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Feature icons — 2x2 on mobile, 4-across on sm+ */}
          <AnimateOnScroll className="md:col-span-7" delay={0.18}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 h-full">
              <FeatureIcon
                icon={ShoppingCart}
                label={m.bentoCartReady}
                animationClass="animate-bounce"
              />
              <FeatureIcon
                icon={Globe}
                label={m.bentoI18nReady}
                animationClass="animate-spin"
              />
              <FeatureIcon icon={CreditCard} label={m.bentoStripe} />
              <FeatureIcon
                icon={Database}
                label={m.bentoDatabase}
                animationClass="animate-pulse"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}
