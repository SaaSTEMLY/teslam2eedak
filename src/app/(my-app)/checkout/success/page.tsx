import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CheckoutSuccess } from "@/components/checkout/checkout-success";
import { getMessages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Order Confirmed | SaaSTARTER",
  description: "Your order has been confirmed. Thank you for your purchase!",
};

function SuccessLoading() {
  return (
    <div className="py-20 text-center">
      <Loader2 className="mx-auto size-6 text-muted-foreground animate-spin mb-4" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

export default async function CheckoutSuccessPage() {
  const m = await getMessages("checkout");

  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<SuccessLoading />}>
          <CheckoutSuccess translations={m} />
        </Suspense>
      </div>
    </main>
  );
}
