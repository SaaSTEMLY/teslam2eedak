import { FaqClient } from "./faq-client";
import { FaqAnimationWrapper } from "./faq-animation-wrapper";
import { getLocale } from "@/lib/locale";
import type { Messages } from "@/lib/i18n";
import { createServerApiClient } from "@/lib/api/client";

const defaultFaqs = [
  {
    id: "1",
    question: "Do I need to download an app to order?",
    answer:
      "No. Scan the QR on the table, the door, or our Instagram — it opens straight in your browser. No download, no signup, no friction.",
  },
  {
    id: "2",
    question: "Can I order ahead and just walk in?",
    answer:
      "Yes — pick 'Click & Collect', choose ASAP or a time slot, pay, and we'll start brewing the minute you tap pay. Walk up to the bar, give us your order number, and you're out the door.",
  },
  {
    id: "3",
    question: "How do I pay?",
    answer:
      "Card on the QR (Visa, Mastercard, Meeza) — dine-in always pays before the kitchen starts. For Click & Collect you can choose card now or cash when you pick up.",
  },
  {
    id: "4",
    question: "Do you charge VAT and a service charge?",
    answer:
      "VAT is 14% (Egyptian law) and a 12% service charge applies to dine-in orders. Both are itemised in your cart before you pay — no surprises. Click & Collect orders don't get a service charge.",
  },
  {
    id: "5",
    question: "Can I customise my drink?",
    answer:
      "Yes — swap milk (oat, almond, soy), add a shot, change the sweetness, choose hot or iced. Anything we have at the bar is on the menu.",
  },
  {
    id: "6",
    question: "What about allergies and dietary preferences?",
    answer:
      "Toggle the allergen filter at the top of the menu — vegan, vegetarian, dairy-free, gluten-free. Items that don't match are dimmed. Every item shows its allergen tags on the detail sheet.",
  },
  {
    id: "7",
    question: "Where are you?",
    answer:
      "Currently at Maadi, Cairo. More branches coming. Hours, directions, and a map are on the Contact page.",
  },
  {
    id: "8",
    question: "Can I get a printed receipt for my expenses?",
    answer:
      "Every order has a tracker URL you can bookmark — it's also your receipt. Tap 'Email me the receipt' on the success screen if you need a copy. We can add a printed receipt at the counter on request.",
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
