"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { Button } from "@/components/ui/button";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

interface PayPayload {
  orderId: string | number;
  amountQirsh: number;
  currency: string;
  clientSecret: string;
}

function formatLE(q: number): string {
  return `${(q / 100).toFixed(2)} LE`;
}

export function QrPayClient({ orderId }: { orderId: string | number }) {
  const [data, setData] = useState<PayPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/payment-intent`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setError(`Failed to load payment (${res.status})`);
          return;
        }
        const body = (await res.json()) as PayPayload;
        if (!cancelled) setData(body);
      } catch {
        if (!cancelled) setError("Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <AlertTriangle className="size-8 mx-auto text-destructive" />
          <h1 className="text-xl font-bold">{error}</h1>
        </div>
      </main>
    );
  }

  if (!data || !stripePromise) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: data.clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            borderRadius: "10px",
            fontFamily: "Outfit, system-ui, sans-serif",
            colorPrimary: "#7a8f4f",
          },
        },
      }}
    >
      <PayInner orderId={orderId} amountQirsh={data.amountQirsh} />
    </Elements>
  );
}

function PayInner({
  orderId,
  amountQirsh,
}: {
  orderId: string | number;
  amountQirsh: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackerUrl = useMemo(
    () => `/orders/${orderId}/track`,
    [orderId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || submitting) return;
    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${trackerUrl}`,
      },
      redirect: "if_required",
    });
    if (result.error) {
      setError(result.error.message ?? "Payment failed");
      setSubmitting(false);
      return;
    }
    router.push(trackerUrl);
  };

  return (
    <main className="min-h-[80vh] py-10 px-4" id="main-content">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-5"
      >
        <header className="text-center space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Order #{orderId}
          </p>
          <h1 className="font-serif text-2xl font-bold">
            Pay {formatLE(amountQirsh)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Card payment to send your order to the bar.
          </p>
        </header>

        <PaymentElement
          options={{
            layout: { type: "tabs", defaultCollapsed: false },
          }}
        />

        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={!stripe || submitting}
          className="w-full rounded-full"
        >
          {submitting ? "Confirming…" : `Pay ${formatLE(amountQirsh)}`}
        </Button>

        <p className="text-[11px] text-center text-muted-foreground">
          Powered by Stripe. Card details are never seen by Koffee Kulture.
        </p>
      </form>
    </main>
  );
}
