import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { ArrowLeft } from "lucide-react";
import { FaqClient } from "@/components/landing/faq-client";
import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";
import { createServerApiClient } from "@/lib/api/client";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("faq");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/faq",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/faq",
    },
  };
}

async function getDefaultFaqs(): Promise<FaqItem[]> {
  const m = await getMessages("faq");

  return [
    {
      id: "1",
      question: m.faq1Question,
      answer: m.faq1Answer,
    },
    {
      id: "2",
      question: m.faq2Question,
      answer: m.faq2Answer,
    },
    {
      id: "3",
      question: m.faq3Question,
      answer: m.faq3Answer,
    },
    {
      id: "4",
      question: m.faq4Question,
      answer: m.faq4Answer,
    },
    {
      id: "5",
      question: m.faq5Question,
      answer: m.faq5Answer,
    },
    {
      id: "6",
      question: m.faq6Question,
      answer: m.faq6Answer,
    },
    {
      id: "7",
      question: m.faq7Question,
      answer: m.faq7Answer,
    },
    {
      id: "8",
      question: m.faq8Question,
      answer: m.faq8Answer,
    },
  ];
}

export default async function FaqPage() {
  const m = await getMessages("faq");
  const locale = await getLocale();
  let faqs = await getDefaultFaqs();

  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/faqs", {
      params: {
        query: {
          locale,
          where: { isActive: { equals: true } },
          sort: "order",
          limit: 100,
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
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          {m.backToHome}
        </Link>

        <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
          {m.pageTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {m.pageSubtitle}{" "}
          <Link
            href="/contact"
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            {m.contactLink}
          </Link>{" "}
          {m.contactPrompt}
        </p>

        <div className="mt-16 sm:mt-20">
          {faqs.length > 0 ? (
            <FaqClient faqs={faqs} showHeader={false} />
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {m.noFaqsTitle}
              </h2>
              <p className="text-muted-foreground">
                {m.noFaqsDescription}{" "}
                <Link
                  href="/contact"
                  className="text-foreground hover:text-muted-foreground transition-colors"
                >
                  {m.noFaqsContactLink}
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
