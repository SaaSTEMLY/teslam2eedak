import type { Metadata } from "next";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Checkout | SaaSTARTER",
  description: "Complete your purchase securely with Stripe.",
};

export default async function CheckoutPage() {
  const m = await getMessages("checkout");
  const addCardMessages = await getMessages("add-card-dialog");
  const locale = await getLocale();

  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none tracking-tight text-foreground">
          {m.pageTitle}.
        </h1>
        <p className="mt-3 text-muted-foreground">{m.pageDescription}</p>

        <div className="mt-12">
          <CheckoutContent
            translations={m}
            addCardTranslations={addCardMessages}
            locale={locale}
          />
        </div>
      </div>
    </main>
  );
}
