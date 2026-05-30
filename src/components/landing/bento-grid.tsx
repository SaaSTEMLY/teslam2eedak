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
              <div className="mx-3 mb-3 rounded-xl bg-[#1a1a2e] p-4 sm:p-5 font-mono text-[11px] sm:text-xs leading-relaxed text-gray-400 overflow-hidden">
                <div>
                  <span className="text-[#c792ea]">import</span> {"{"}{" "}
                  <span className="text-[#ffcb6b]">Button</span> {"}"}{" "}
                  <span className="text-[#c792ea]">from</span>{" "}
                  <span className="text-[#c3e88d]">&quot;@/ui&quot;</span>
                </div>
                <div className="mt-0.5">
                  <span className="text-[#c792ea]">import</span> {"{"}{" "}
                  <span className="text-[#ffcb6b]">Stripe</span> {"}"}{" "}
                  <span className="text-[#c792ea]">from</span>{" "}
                  <span className="text-[#c3e88d]">&quot;stripe&quot;</span>
                </div>
                <div className="mt-3">
                  <span className="text-[#c792ea]">
                    export default function
                  </span>{" "}
                  <span className="text-[#82aaff]">Checkout</span>() {"{"}
                </div>
                <div className="ms-4">
                  <span className="text-[#c792ea]">const</span>{" "}
                  <span className="text-[#89ddff]">session</span> ={" "}
                  <span className="text-[#c792ea]">await</span>{" "}
                  <span className="text-[#ffcb6b]">stripe</span>.
                  <span className="text-[#82aaff]">checkout</span>({"{"}
                </div>
                <div className="ms-8">
                  <span className="text-[#89ddff]">mode</span>:{" "}
                  <span className="text-[#c3e88d]">&quot;payment&quot;</span>,
                </div>
                <div className="ms-8">
                  <span className="text-[#89ddff]">success_url</span>:{" "}
                  <span className="text-[#c3e88d]">&quot;/success&quot;</span>,
                </div>
                <div className="ms-4">{"}"})</div>
                <div className="ms-4">
                  <span className="text-[#c792ea]">return</span>{" "}
                  <span className="text-gray-500">&lt;</span>
                  <span className="text-[#ffcb6b]">Button</span>
                  <span className="text-gray-500">&gt;</span>Pay
                  <span className="text-gray-500">&lt;/</span>
                  <span className="text-[#ffcb6b]">Button</span>
                  <span className="text-gray-500">&gt;</span>
                </div>
                <div>{"}"}</div>
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
