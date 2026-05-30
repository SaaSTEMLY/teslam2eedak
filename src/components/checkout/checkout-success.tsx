"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "@/components/Link/customLink";
import { CheckCircle, Loader2, XCircle, Package } from "lucide-react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n";

interface CheckoutSuccessProps {
  translations: Messages<"checkout">;
}

export function CheckoutSuccess({ translations: m }: CheckoutSuccessProps) {
  const searchParams = useSearchParams();
  const { clearCart, cart } = useCart();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const confirmedRef = useRef(false);

  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  useEffect(() => {
    if (confirmedRef.current) return;

    if (redirectStatus !== "succeeded") {
      confirmedRef.current = true;
      setStatus("error");
      setErrorMessage(m.errorPaymentFailed);
      return;
    }

    if (!paymentIntent) {
      confirmedRef.current = true;
      setStatus("error");
      setErrorMessage(m.errorConfirmingOrder);
      return;
    }

    // The provider's isLoading starts as false and only toggles during explicit
    // cart operations, so it does NOT indicate the initial cart fetch is done.
    // Instead, wait for cart?.id to be set which means the provider has finished
    // fetching the user's cart from the API.
    if (!cart?.id) return;

    confirmedRef.current = true;

    const confirm = async () => {
      try {
        const response = await fetch("/api/payments/stripe/confirm-order", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartID: cart.id,
            currency: "USD",
            paymentIntentID: paymentIntent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Failed to confirm order");
        }

        const result = (await response.json()) as {
          orderID?: string | number;
          message?: string;
        };

        if (result?.orderID) {
          setOrderId(result.orderID);
          setStatus("success");
          await clearCart();
        } else {
          // Order creation failed but payment succeeded - critical issue
          console.error("Payment succeeded but order creation failed");
          setStatus("error");
          setErrorMessage(
            m.errorConfirmingOrder +
              " - Please contact support with payment intent: " +
              paymentIntent,
          );
        }
      } catch (err) {
        console.error("Order confirmation error:", err);
        // Payment succeeded on Stripe but order confirmation failed
        // This is a critical issue that requires manual intervention
        setStatus("error");
        setErrorMessage(
          m.errorConfirmingOrder +
            " - Your payment was processed. Please contact support immediately with payment intent: " +
            paymentIntent,
        );
        // DO NOT clear cart - preserve evidence for support
      }
    };

    confirm();
  }, [
    paymentIntent,
    redirectStatus,
    cart?.id,
    clearCart,
    m.errorPaymentFailed,
    m.errorConfirmingOrder,
  ]);

  if (status === "loading") {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-6">
          <Loader2 className="size-8 text-muted-foreground animate-spin" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          {m.confirmingOrder}
        </h2>
        <p className="text-muted-foreground">{m.pleaseWait}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-destructive/10 mb-6">
          <XCircle className="size-8 text-destructive" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          {m.somethingWentWrong}
        </h2>
        <p className="text-muted-foreground mb-6">
          {errorMessage || m.errorConfirmingOrder}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild>
            <Link href="/checkout">{m.tryAgain}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">{m.contactSupport}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/10 mb-6">
        <CheckCircle className="size-8 text-green-500" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-foreground mb-3">
        {m.thankYouForPurchase}
      </h2>
      <p className="text-muted-foreground mb-2">{m.orderConfirmed}</p>
      {orderId && (
        <p className="text-sm text-muted-foreground mb-8">
          {m.orderId}{" "}
          <span className="font-mono font-medium text-foreground">
            {orderId}
          </span>
        </p>
      )}
      {!orderId && <div className="mb-8" />}

      <div className="p-6 rounded-2xl bg-card/60 border border-border/50 mb-8">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Package className="size-5 text-primary" />
          <span className="font-medium text-foreground">
            {m.whatHappensNext}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {m.confirmationEmailMessage}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild>
          <Link href="/account/orders">{m.viewYourOrders}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/products">{m.continueShopping}</Link>
        </Button>
      </div>
    </div>
  );
}
