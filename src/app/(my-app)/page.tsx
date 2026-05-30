import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/hero-section";
import { LogoMarquee } from "@/components/landing/logo-marquee";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FinalCta } from "@/components/landing/final-cta";
import { BentoGrid } from "@/components/landing/bento-grid";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title:
    "SaaSTARTER - Ship Your SaaS in Days, Not Months | Next.js SaaS Template",
  description:
    "The production-ready Next.js SaaS template with Stripe payments, authentication, eCommerce, and 50+ pre-built components. Stop building boilerplate — start shipping.",
  keywords: [
    "SaaS template",
    "Next.js template",
    "SaaS boilerplate",
    "Stripe integration",
    "shadcn/ui",
    "PayloadCMS",
    "eCommerce template",
    "React SaaS starter",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SaaSTARTER - Ship Your SaaS in Days, Not Months",
    description:
      "Production-ready Next.js SaaS template with eCommerce, authentication, payments, and everything you need to launch.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/logo/main/pwa-512x512.png",
        width: 512,
        height: 512,
        alt: "SaaSTARTER - Ship Your SaaS in Days, Not Months",
      },
    ],
  },
};

export default async function Home() {
  const [m, footerMessages] = await Promise.all([
    getMessages("home"),
    getMessages("footer"),
  ]);

  return (
    <main id="main-content">
      <HeroSection messages={m} />
      <LogoMarquee messages={m} />
      <FeaturesSection messages={m} />
      <BentoGrid messages={m} />
      <PricingSection messages={m} />
      <TestimonialsSection messages={m} />
      <FaqSection messages={m} />
      <FinalCta messages={m} footerMessages={footerMessages} />
    </main>
  );
}
