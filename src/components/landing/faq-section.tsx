import { FaqClient } from "./faq-client";
import { FaqAnimationWrapper } from "./faq-animation-wrapper";
import { getLocale } from "@/lib/locale";
import type { Messages } from "@/lib/i18n";
import { createServerApiClient } from "@/lib/api/client";

const defaultFaqs = [
  {
    id: "1",
    question: "What's included in SaaSTARTER?",
    answer:
      "SaaSTARTER includes a complete Next.js application with authentication (better-auth), payments (Stripe), eCommerce functionality, admin dashboard, internationalization, and over 50 pre-built components. Everything you need to launch a SaaS product.",
  },
  {
    id: "2",
    question: "Do I need coding experience?",
    answer:
      "Basic knowledge of React and TypeScript is recommended. SaaSTARTER is designed for developers who want to ship faster, not for complete beginners. However, the code is well-documented and follows best practices.",
  },
  {
    id: "3",
    question: "Is this a subscription or one-time payment?",
    answer:
      "SaaSTARTER is a one-time purchase. You pay once and get lifetime access to the codebase. No recurring fees, no hidden costs.",
  },
  {
    id: "4",
    question: "Can I use this for client projects?",
    answer:
      "Yes! Your license allows you to use SaaSTARTER for unlimited personal and client projects. You can build and deploy as many applications as you want.",
  },
  {
    id: "5",
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and digital wallets through Stripe. This includes Visa, Mastercard, American Express, and more.",
  },
  {
    id: "6",
    question: "Do you offer refunds?",
    answer:
      "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with SaaSTARTER, contact us within 14 days of purchase for a full refund.",
  },
  {
    id: "7",
    question: "How do updates work?",
    answer:
      "Starter plan includes free updates for 1 year. Pro plan includes lifetime updates. You'll get access to our private repository where all updates are pushed regularly.",
  },
  {
    id: "8",
    question: "What kind of support is included?",
    answer:
      "Starter plan includes community support via GitHub Discussions. Pro plan includes priority support via private Discord channel and a 1-on-1 setup call to help you get started.",
  },
];

export async function FaqSection({
  messages: m,
}: {
  messages: Messages<"home">;
}) {
  let faqs = defaultFaqs;
  const locale = await getLocale();

  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/faqs", {
      params: {
        query: {
          locale,
          where: { isActive: { equals: true } },
          sort: "order",
          limit: 50,
        },
      },
    });

    const docs = data?.docs;
    if (docs && docs.length > 0) {
      faqs = docs.map((doc) => ({
        id: String(doc.id),
        question: doc.question,
        answer: doc.answer,
      }));
    }
  } catch {
    // Use default FAQs if API is not available
  }

  return (
    <section id="faq" className="py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <FaqAnimationWrapper>
          <FaqClient faqs={faqs} title={m.faqTitle} subtitle={m.faqSubtitle} />
        </FaqAnimationWrapper>
      </div>
    </section>
  );
}
