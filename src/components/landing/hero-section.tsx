"use client";

import Link from "@/components/Link/customLink";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Messages } from "@/lib/i18n";

export function HeroSection({ messages: m }: { messages: Messages<"home"> }) {
  return (
    <section className="relative flex min-h-[90vh] items-end justify-center overflow-hidden pb-24 pt-40 sm:items-center sm:pb-32 sm:pt-20">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3 dark:from-primary/10 dark:to-primary/5" />
        <div className="hero-gradient-orb absolute -top-1/4 start-1/4 size-[600px] rounded-full bg-primary/5 blur-3xl dark:bg-primary/10" />
        <div className="hero-gradient-orb-delayed absolute -bottom-1/4 end-1/4 size-[500px] rounded-full bg-primary/3 blur-3xl dark:bg-primary/8" />
      </div>

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          {m.heroTagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-serif text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.9] tracking-tight text-foreground"
        >
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {m.heroTitle}
          </span>
          <br />
          <span className="text-muted-foreground/40">{m.heroTitleFaded}</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex max-w-xl flex-col gap-6 sm:mt-14"
        >
          <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {m.heroDescription}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <Button
              size="lg"
              className="group h-12 rounded-xl px-8 text-base font-semibold"
              asChild
            >
              <Link href="/products">
                {m.heroGetStarted}
                <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-6 text-base text-muted-foreground"
              asChild
            >
              <Link href="#features">{m.heroSeeFeatures}</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
