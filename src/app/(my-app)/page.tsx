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
    "Koffee Kulture — Scan. Sip. Repeat. | House-roasted coffee, Maadi · Cairo",
  description:
    "Maadi's house-roasted koffee, all-day breakfast, and the bagels Kairo whispers about. Scan the table QR or order ahead — no app required.",
  keywords: [
    "Koffee Kulture",
    "Maadi coffee",
    "Cairo café",
    "specialty coffee Cairo",
    "QR menu order",
    "click and collect Cairo",
    "Maadi breakfast",
    "Egyptian coffee shop",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Koffee Kulture — Scan. Sip. Repeat.",
    description:
      "House-roasted koffee, all-day breakfast, and the bagels Kairo whispers about. Maadi · Cairo.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/logo/main/pwa-512x512.png",
        width: 512,
        height: 512,
        alt: "Koffee Kulture — Scan. Sip. Repeat.",
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
