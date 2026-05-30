"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/Link/customLink";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  useCart,
  usePayments,
  useEcommerce,
  useAddresses,
} from "@payloadcms/plugin-ecommerce/client/react";
import { useAuthenticate } from "@daveyplate/better-auth-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutForm } from "./checkout-form";
import { PaymentForm } from "./payment-form";
import { OrderSummary } from "./order-summary";
import type { Address } from "@/payload-types";
import type { Messages } from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/locale";
import { useCartDiscount } from "@/hooks/use-cart-discount";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface ShippingData {
  email: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
}

interface CheckoutContentProps {
  translations: Messages<"checkout">;
  addCardTranslations: Messages<"add-card-dialog">;
  locale: SupportedLocale;
}

export function CheckoutContent({
  translations: m,
  addCardTranslations,
  locale,
}: CheckoutContentProps) {
  const { cart, refreshCart, isLoading: isCartLoading } = useCart();
  const { initiatePayment } = usePayments();
  const { user, isLoading: isUserLoading } = useEcommerce();
  const { data: session } = useAuthenticate({ enabled: false });
  const {
    addresses,
    createAddress,
    updateAddress,
    isLoading: isAddressesLoading,
  } = useAddresses<Address>();

  // Memoize to prevent unnecessary recalculations
  const savedAddress = useMemo(() => addresses?.[0] ?? null, [addresses]);
  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  // Determine if we're still loading initial data OR if cart hasn't loaded yet
  const isInitialLoading =
    isCartLoading || isUserLoading || isAddressesLoading || cart === undefined;

  // Create a locale-aware currency formatter that uses proper numbering system (amount is in cents)
  const formatLocalizedCurrency = (value?: number | null) => {
    const amount = value ?? 0;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      numberingSystem: locale === "ar" ? "arab" : "latn",
    }).format(amount / 100);
  };

  const [step, setStep] = useState<"info" | "payment">("info");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [verifiedAmount, setVerifiedAmount] = useState<number | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const {
    discount,
    applyDiscountCode,
    removeDiscount,
    isValidating: isDiscountValidating,
    error: discountError,
    clearError: clearDiscountError,
  } = useCartDiscount({
    invalid: m.errorInvalidDiscount,
    validating: m.errorValidatingDiscount,
  });
  const previousDiscountCodeRef = useRef<string | null>(null);

  const handleApplyDiscount = async (code: string) => {
    const applied = await applyDiscountCode(code);
    return !!applied;
  };

  const handleRemoveDiscount = async () => {
    await removeDiscount();
  };

  useEffect(() => {
    const currentCode = discount?.code ?? null;
    const previousCode = previousDiscountCodeRef.current;
    if (previousCode === currentCode) return;
    previousDiscountCodeRef.current = currentCode;
    if (!previousCode && !currentCode) return;
    // Reset verified amount so it gets re-verified with the new discount,
    // but keep clientSecret to avoid creating a duplicate transaction.
    setVerifiedAmount(null);
    if (step === "payment") {
      setStep("info");
    }
  }, [discount?.code, step]);

  // Show skeleton loader while initial data is loading
  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // Only check for empty cart after loading is complete and cart has loaded
  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-6">
          <ShoppingBag className="size-8 text-muted-foreground" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          {m.cartEmpty}
        </h2>
        <p className="text-muted-foreground mb-6">{m.emptyCartMessage}</p>
        <Button asChild>
          <Link href="/products">{m.browseProducts}</Link>
        </Button>
      </div>
    );
  }

  const handleInitiatePayment = async (data: ShippingData) => {
    setError(null);
    setIsInitiating(true);

    try {
      // If we already have a clientSecret from a previous initiation, reuse it
      // instead of creating a duplicate transaction (which causes a unique ID conflict).
      if (clientSecret) {
        // Verify the payment intent is still valid and in correct state
        const piId = clientSecret.split("_secret_")[0] ?? "";
        try {
          const { response: verifyRes } = await api.POST(
            "/api/payment-amount",
            {
              body: { paymentIntentId: piId },
            },
          );

          if (!verifyRes?.ok) {
            // Payment intent is invalid, need to create a new one
            setClientSecret(null);
            setVerifiedAmount(null);
            // Don't return, let it fall through to create new payment intent
          } else {
            // Re-verify amount if needed (e.g. discount was applied/removed)
            if (verifiedAmount === null) {
              try {
                const { data: amountData, response: amountRes } =
                  await api.POST("/api/payment-amount", {
                    body: {
                      paymentIntentId: piId ?? "",
                      ...(discount ? { discountCode: discount.code } : {}),
                    },
                  });
                if (!amountRes?.ok) {
                  setError(m.errorVerifyingAmount);
                  return;
                }
                if (amountData?.amount == null) {
                  setError(m.errorVerifyingAmount);
                  return;
                }
                setVerifiedAmount(amountData.amount);
              } catch {
                setError(m.errorVerifyingAmount);
                return;
              }
            }

            // Save address if user opted in
            if (data.saveAddress && user) {
              const addressPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || undefined,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
              };

              try {
                if (savedAddress?.id) {
                  await updateAddress(savedAddress.id, addressPayload);
                } else {
                  await createAddress(addressPayload);
                }
              } catch {
                // Non-critical — continue to payment
              }
            }

            setShippingData(data);
            setStep("payment");
            return;
          }
        } catch {
          // If verification failed, fall through to create new payment intent
          setClientSecret(null);
          setVerifiedAmount(null);
        }
      }

      // Only create new payment intent if we don't have a valid one
      if (!clientSecret) {
        const addressData = {
          firstName: data.firstName,
          lastName: data.lastName,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || undefined,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        };

        const result = (await initiatePayment("stripe", {
          additionalData: {
            customerEmail: data.email,
            shippingAddress: addressData,
          },
        })) as { clientSecret?: string; message?: string };

        if (result?.clientSecret) {
          // Fetch server-authoritative payment amount
          const piId = result.clientSecret.split("_secret_")[0] ?? "";
          try {
            const { data: amountData, response: amountRes } = await api.POST(
              "/api/payment-amount",
              {
                body: {
                  paymentIntentId: piId,
                  ...(discount ? { discountCode: discount.code } : {}),
                },
              },
            );
            if (!amountRes?.ok) {
              setError(m.errorVerifyingAmount);
              return;
            }
            if (amountData?.amount == null) {
              setError(m.errorVerifyingAmount);
              return;
            }
            setVerifiedAmount(amountData.amount);
          } catch {
            setError(m.errorVerifyingAmount);
            return;
          }

          // Save address if user opted in
          if (data.saveAddress && user) {
            const addressPayload = {
              firstName: data.firstName,
              lastName: data.lastName,
              addressLine1: data.addressLine1,
              addressLine2: data.addressLine2 || undefined,
              city: data.city,
              state: data.state,
              postalCode: data.postalCode,
              country: data.country,
            };

            try {
              if (savedAddress?.id) {
                await updateAddress(savedAddress.id, addressPayload);
              } else {
                await createAddress(addressPayload);
              }
            } catch {
              // Non-critical — continue to payment
            }
          }

          setShippingData(data);
          setClientSecret(result.clientSecret);
          setStep("payment");
        } else {
          setError(result?.message || m.errorInitiatingPayment);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // When returning to checkout after a previous attempt, the cart may carry
      // stale item row IDs that conflict with the new transaction the plugin
      // tries to create (Payload validation: "The following field is invalid: id").
      // Refresh the cart to obtain clean IDs and retry once.
      if (message.includes("field is invalid: id")) {
        try {
          await refreshCart();
          const retryResult = (await initiatePayment("stripe", {
            additionalData: {
              customerEmail: data.email,
              shippingAddress: {
                firstName: data.firstName,
                lastName: data.lastName,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || undefined,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
              },
            },
          })) as { clientSecret?: string; message?: string };

          if (retryResult?.clientSecret) {
            const piId = retryResult.clientSecret.split("_secret_")[0] ?? "";
            const { data: amountData, response: amountRes } = await api.POST(
              "/api/payment-amount",
              {
                body: {
                  paymentIntentId: piId,
                  ...(discount ? { discountCode: discount.code } : {}),
                },
              },
            );
            if (amountRes?.ok) {
              if (amountData?.amount != null) {
                setVerifiedAmount(amountData.amount);
                setShippingData(data);
                setClientSecret(retryResult.clientSecret);
                setStep("payment");
                return;
              }
            }
          }
        } catch {
          // Retry also failed — fall through to user-facing error below
        }

        setError(m.errorSessionExpired);
        return;
      }

      setError(message || m.errorUnexpected);
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
      {/* Main Form Area */}
      <div className="lg:col-span-3">
        {step === "payment" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep("info")}
            className="gap-2 text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="size-4" />
            {m.backToBilling}
          </Button>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}
        {step === "info" && (
          <CheckoutForm
            onSubmit={handleInitiatePayment}
            isLoading={isInitiating}
            defaultEmail={session?.user?.email ?? ""}
            userName={session?.user?.name ?? user?.email ?? null}
            isLoggedIn={!!user}
            defaultAddress={savedAddress}
            translations={m}
          />
        )}
        {step === "payment" && clientSecret && verifiedAmount !== null && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  borderRadius: "8px",
                  fontFamily: "Inter, system-ui, sans-serif",
                },
              },
            }}
          >
            <PaymentForm
              subtotal={verifiedAmount}
              formatCurrency={formatLocalizedCurrency}
              isLoggedIn={!!user}
              clientSecret={clientSecret}
              shippingAddress={
                shippingData
                  ? {
                      firstName: shippingData.firstName,
                      lastName: shippingData.lastName,
                      addressLine1: shippingData.addressLine1,
                      addressLine2: shippingData.addressLine2,
                      city: shippingData.city,
                      state: shippingData.state,
                      postalCode: shippingData.postalCode,
                      country: shippingData.country,
                    }
                  : undefined
              }
              customerEmail={shippingData?.email}
              translations={m}
              addCardTranslations={addCardTranslations}
            />
          </Elements>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-2">
        <OrderSummary
          discount={discount}
          onApplyDiscount={step === "info" ? handleApplyDiscount : undefined}
          onRemoveDiscount={step === "info" ? handleRemoveDiscount : undefined}
          isValidatingDiscount={isDiscountValidating}
          discountError={discountError}
          onClearDiscountError={clearDiscountError}
          translations={m}
          locale={locale}
        />
      </div>
    </div>
  );
}
