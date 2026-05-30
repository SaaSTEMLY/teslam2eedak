"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { Loader2, Lock, ShieldCheck, MapPin, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultCountries } from "@payloadcms/plugin-ecommerce/client/react";
import { AddCardDialog } from "@/components/shared/add-card-dialog";
import {
  SavedCardsManager,
  type SavedCard,
} from "@/components/shared/saved-cards-manager";
import type { Messages } from "@/lib/i18n";

interface CardBillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface PaymentFormProps {
  subtotal: number;
  formatCurrency: (value?: number | null) => string;
  isLoggedIn?: boolean;
  clientSecret: string;
  shippingAddress?: CardBillingAddress;
  customerEmail?: string;
  translations: Messages<"checkout">;
  addCardTranslations: Messages<"add-card-dialog">;
}

const EMPTY_BILLING: CardBillingAddress = {
  firstName: "",
  lastName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

const INPUT_CLS =
  "h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200";

export function PaymentForm({
  subtotal,
  formatCurrency,
  isLoggedIn,
  clientSecret,
  shippingAddress,
  customerEmail,
  translations: m,
  addCardTranslations,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Billing address for new card
  const [billingAddress, setBillingAddress] = useState<CardBillingAddress>(
    shippingAddress ?? EMPTY_BILLING,
  );

  // Saved cards (logged-in only)
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(!!isLoggedIn);
  const [selectedMethod, setSelectedMethod] = useState<string>("new");
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  const fetchCards = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingCards(true);

    try {
      const res = await fetch("/api/billing");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const cards: SavedCard[] = data.cards ?? [];
      setSavedCards(cards);

      const defaultCard = cards.find((c) => c.isDefault);
      if (defaultCard) {
        setSelectedMethod(defaultCard.id);
      } else if (cards.length > 0) {
        setSelectedMethod(cards[0]!.id);
      }
    } catch {
      // Silent fail — user can still enter card manually
    } finally {
      setIsLoadingCards(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) return;

    setIsProcessing(true);
    setError(null);

    try {
      if (selectedMethod !== "new") {
        // Pay with saved card
        const selectedCard = savedCards.find((c) => c.id === selectedMethod);

        // Update the transaction's billing address before confirming payment,
        // since confirmPayment redirects the browser on success
        if (selectedCard?.billingAddress?.addressLine1) {
          const piId = clientSecret.split("_secret_")[0];
          try {
            await fetch("/api/billing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "update-transaction-billing",
                paymentIntentId: piId,
                billingAddress: selectedCard.billingAddress,
              }),
            });
          } catch {
            // Non-critical — continue with payment
          }
        }

        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: {
            payment_method: selectedMethod,
            return_url: `${window.location.origin}/checkout/success`,
          },
        });

        if (confirmError) {
          setError(confirmError.message ?? m.errorPaymentFailed);
          setIsProcessing(false);
        }
      } else {
        // Pay with PaymentElement (new card)
        if (!elements) return;

        const addr = billingAddress;

        // Update the transaction's billing address before confirming payment
        const piId = clientSecret.split("_secret_")[0];
        try {
          await fetch("/api/billing", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update-transaction-billing",
              paymentIntentId: piId,
              billingAddress: addr,
            }),
          });
        } catch {
          // Non-critical — continue with payment
        }

        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/checkout/success`,
            payment_method_data: {
              billing_details: {
                name: `${addr.firstName} ${addr.lastName}`.trim() || undefined,
                email: customerEmail || undefined,
                address: {
                  line1: addr.addressLine1 || undefined,
                  line2: addr.addressLine2 || undefined,
                  city: addr.city || undefined,
                  state: addr.state || undefined,
                  postal_code: addr.postalCode || undefined,
                  country: addr.country || undefined,
                },
              },
            },
            ...(isLoggedIn && savePaymentMethod
              ? { setup_future_usage: "off_session" }
              : {}),
          },
        });

        if (confirmError) {
          setError(confirmError.message ?? m.errorPaymentFailed);
          setIsProcessing(false);
        }
      }
    } catch {
      setError(m.errorUnexpected);
      setIsProcessing(false);
    }
  };

  const handleCardAdded = useCallback(async () => {
    setShowAddCardDialog(false);
    await fetchCards();
  }, [fetchCards]);

  const handleCardsChange = useCallback((cards: SavedCard[]) => {
    setSavedCards(cards);
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            {m.paymentDetails}
          </h2>

          {/* Saved cards section (logged-in users) */}
          {isLoggedIn && (
            <div className="mb-4">
              <SavedCardsManager
                mode="radio"
                selectedCardId={selectedMethod}
                onCardSelect={setSelectedMethod}
                showNewCardOption={true}
                onCardsChange={handleCardsChange}
                onAddNewCard={() => setShowAddCardDialog(true)}
                translations={{
                  endingIn: "••••",
                  expires: "Exp",
                  defaultCardBadge: m.default,
                  edit: m.editCard,
                  remove: m.removeCard,
                  addCard: m.addNewCard,
                  editCardTitle: m.editCardTitle,
                  editCardDescription: m.editCardDescription,
                  cardNickname: m.cardNickname,
                  cardNicknamePlaceholder: m.cardNicknamePlaceholder,
                  billingAddress: m.billingAddress,
                  firstName: m.firstName,
                  firstNamePlaceholder: m.firstNamePlaceholder,
                  lastName: m.lastName,
                  lastNamePlaceholder: m.lastNamePlaceholder,
                  address: m.address,
                  addressPlaceholder: m.addressPlaceholder,
                  addressLine2: m.addressLine2,
                  addressLine2Placeholder: m.addressLine2Placeholder,
                  city: m.city,
                  cityPlaceholder: m.cityPlaceholder,
                  state: m.stateProvince,
                  statePlaceholder: m.statePlaceholder,
                  postalCode: m.postalCode,
                  postalCodePlaceholder: m.postalCodePlaceholder,
                  country: m.country,
                  cancel: m.cancel,
                  save: m.updateCard,
                  removing: m.removing,
                  removeCardTitle: m.removeCardTitle,
                  removeCardDescription: m.removeCardDescription,
                  removeCardDescriptionNoAlias: m.removeCardDescriptionNoAlias,
                  removeCardButton: m.removeCardButton,
                  toastCardUpdated: "Card updated",
                  toastCardUpdateFailed: "Failed to update card",
                  toastCardRemoved: m.toastCardRemoved,
                  toastCardRemoveFailed: m.toastCardRemoveFailed,
                }}
              />
            </div>
          )}

          {/* PaymentElement — shown when no saved card is selected or user is guest */}
          {selectedMethod === "new" && !isLoadingCards && (
            <>
              <div className="p-4 rounded-xl border border-border bg-card/50">
                <PaymentElement
                  options={{
                    layout: "tabs",
                  }}
                />
              </div>

              {/* Billing Address */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    {m.billingAddress}
                  </h3>
                  {shippingAddress && (
                    <Button
                      variant="ghost"
                      size="clear"
                      type="button"
                      onClick={() => setBillingAddress(shippingAddress)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="size-3" />
                      {m.copyFromShipping}
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="billing-firstName">First name</Label>
                      <Input
                        id="billing-firstName"
                        required
                        value={billingAddress.firstName}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="John"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="billing-lastName">Last name</Label>
                      <Input
                        id="billing-lastName"
                        required
                        value={billingAddress.lastName}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Doe"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billing-addressLine1">{m.address}</Label>
                    <Input
                      id="billing-addressLine1"
                      required
                      value={billingAddress.addressLine1}
                      onChange={(e) =>
                        setBillingAddress((prev) => ({
                          ...prev,
                          addressLine1: e.target.value,
                        }))
                      }
                      placeholder={m.addressPlaceholder}
                      className={INPUT_CLS}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billing-addressLine2">
                      {m.addressLine2}{" "}
                      <span className="text-muted-foreground font-normal">
                        {m.optional}
                      </span>
                    </Label>
                    <Input
                      id="billing-addressLine2"
                      value={billingAddress.addressLine2}
                      onChange={(e) =>
                        setBillingAddress((prev) => ({
                          ...prev,
                          addressLine2: e.target.value,
                        }))
                      }
                      placeholder={m.addressLine2Placeholder}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="billing-city">City</Label>
                      <Input
                        id="billing-city"
                        required
                        value={billingAddress.city}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            city: e.target.value,
                          }))
                        }
                        placeholder="New York"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="billing-state">State / Province</Label>
                      <Input
                        id="billing-state"
                        required
                        value={billingAddress.state}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            state: e.target.value,
                          }))
                        }
                        placeholder="NY"
                        className={INPUT_CLS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="billing-postalCode">Postal code</Label>
                      <Input
                        id="billing-postalCode"
                        required
                        value={billingAddress.postalCode}
                        onChange={(e) =>
                          setBillingAddress((prev) => ({
                            ...prev,
                            postalCode: e.target.value,
                          }))
                        }
                        placeholder="10001"
                        className={INPUT_CLS}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="billing-country">Country</Label>
                    <select
                      id="billing-country"
                      required
                      value={billingAddress.country}
                      onChange={(e) =>
                        setBillingAddress((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm shadow-xs transition-all duration-200 outline-none focus:border-primary/50 focus:ring-primary/20 focus:ring-4"
                    >
                      {defaultCountries.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Save Payment Method Checkbox (logged-in users only) */}
                {isLoggedIn && (
                  <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50">
                    <input
                      type="checkbox"
                      id="save-payment-method"
                      checked={savePaymentMethod}
                      onChange={(e) => setSavePaymentMethod(e.target.checked)}
                      className="mt-0.5 size-4 rounded border-border/50 text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 transition-all cursor-pointer"
                    />
                    <label
                      htmlFor="save-payment-method"
                      className="text-sm text-foreground cursor-pointer select-none"
                    >
                      <span className="font-medium">{m.savePaymentMethod}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {m.savePaymentMethodDescription}
                      </p>
                    </label>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-semibold gap-2"
          disabled={
            isProcessing ||
            !stripe ||
            isLoadingCards ||
            (selectedMethod === "new" && !elements)
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {m.processingPayment}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {m.pay.replace("{amount}", formatCurrency(subtotal))}
            </>
          )}
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4" />
          <span>{m.securedByStripe}</span>
        </div>
      </form>

      {/* Add Card Dialog */}
      <AddCardDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
        onCardAdded={handleCardAdded}
        shippingAddress={shippingAddress}
        translations={addCardTranslations}
      />
    </>
  );
}
