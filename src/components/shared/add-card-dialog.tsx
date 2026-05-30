"use client";

import { useState, useEffect } from "react";
import { Loader2, MapPin, Copy } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { defaultCountries } from "@payloadcms/plugin-ecommerce/client/react";
import { toast } from "sonner";
import type { Messages } from "@/lib/i18n";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const INPUT_CLS =
  "h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200";

export interface CardBillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCardAdded: () => void;
  shippingAddress?: CardBillingAddress;
  translations: Messages<"add-card-dialog">;
}

export function AddCardDialog({
  open,
  onOpenChange,
  onCardAdded,
  shippingAddress,
  translations: m,
}: AddCardDialogProps) {
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  // Adjust state when dialog opens/closes (render-time state adjustment)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setSetupSecret(null);
    } else {
      setIsLoadingIntent(true);
    }
  }

  useEffect(() => {
    if (!open) return;

    fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup-intent" }),
    })
      .then((res) => res.json())
      .then((data) => setSetupSecret(data.clientSecret ?? null))
      .catch(() => toast.error(m.errorInitializeForm))
      .finally(() => setIsLoadingIntent(false));
  }, [open, m.errorInitializeForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-lg max-h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="sticky top-0 z-10 bg-background rounded-t-xl px-6 pt-6 pb-4 border-b">
          <DialogTitle className="font-serif">{m.dialogTitle}</DialogTitle>
          <DialogDescription>{m.dialogDescription}</DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto overscroll-contain px-6 py-4 flex-1">
          {isLoadingIntent || !setupSecret ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: setupSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    borderRadius: "8px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  },
                },
              }}
            >
              <AddCardForm
                onSaved={onCardAdded}
                onCancel={() => onOpenChange(false)}
                shippingAddress={shippingAddress}
                translations={m}
              />
            </Elements>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddCardForm({
  onSaved,
  onCancel,
  shippingAddress,
  translations: m,
}: {
  onSaved: () => void;
  onCancel: () => void;
  shippingAddress?: CardBillingAddress;
  translations: Messages<"add-card-dialog">;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState<CardBillingAddress>({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  function handleAddressChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSaving(true);
    setError(null);

    try {
      const { error: stripeError, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message ?? m.errorSaveCard);
        setIsSaving(false);
        return;
      }

      // Save billing address and alias to the new payment method's metadata
      const paymentMethodId =
        typeof setupIntent?.payment_method === "string"
          ? setupIntent.payment_method
          : setupIntent?.payment_method?.id;

      if (paymentMethodId) {
        await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-metadata",
            paymentMethodId,
            alias: alias.trim(),
            billingAddress: address,
          }),
        });
      }

      toast.success(m.successCardAdded);
      onSaved();
    } catch {
      setError(m.errorSaveCard);
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 rounded-xl border border-border bg-card/50">
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-alias">
          {m.cardNickname}{" "}
          <span className="text-muted-foreground font-normal">
            {m.optional}
          </span>
        </Label>
        <Input
          id="new-alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder={m.cardNicknamePlaceholder}
          className={INPUT_CLS}
        />
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground flex items-center gap-2">
          <MapPin className="size-3.5 text-muted-foreground" />
          {m.billingAddress}
        </p>
        {shippingAddress && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => setAddress(shippingAddress)}
          >
            <Copy className="size-3" />
            {m.copyFromShipping}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-firstName">{m.firstName}</Label>
          <Input
            id="new-firstName"
            name="firstName"
            value={address.firstName}
            onChange={handleAddressChange}
            placeholder={m.firstNamePlaceholder}
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-lastName">{m.lastName}</Label>
          <Input
            id="new-lastName"
            name="lastName"
            value={address.lastName}
            onChange={handleAddressChange}
            placeholder={m.lastNamePlaceholder}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-addressLine1">{m.address}</Label>
        <Input
          id="new-addressLine1"
          name="addressLine1"
          value={address.addressLine1}
          onChange={handleAddressChange}
          placeholder={m.addressPlaceholder}
          className={INPUT_CLS}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-addressLine2">
          {m.apartmentSuite}{" "}
          <span className="text-muted-foreground font-normal">
            {m.optional}
          </span>
        </Label>
        <Input
          id="new-addressLine2"
          name="addressLine2"
          value={address.addressLine2}
          onChange={handleAddressChange}
          placeholder={m.apartmentPlaceholder}
          className={INPUT_CLS}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-city">{m.city}</Label>
          <Input
            id="new-city"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            placeholder={m.cityPlaceholder}
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-state">{m.stateProvince}</Label>
          <Input
            id="new-state"
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            placeholder={m.statePlaceholder}
            className={INPUT_CLS}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-postalCode">{m.postalCode}</Label>
          <Input
            id="new-postalCode"
            name="postalCode"
            value={address.postalCode}
            onChange={handleAddressChange}
            placeholder={m.postalCodePlaceholder}
            className={INPUT_CLS}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="new-country">{m.country}</Label>
        <select
          id="new-country"
          name="country"
          value={address.country}
          onChange={handleAddressChange}
          className="flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm shadow-xs transition-all duration-200 outline-none focus:border-primary/50 focus:ring-primary/20 focus:ring-4"
        >
          {defaultCountries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl"
        >
          {m.cancel}
        </Button>
        <Button
          type="submit"
          disabled={isSaving || !stripe || !elements}
          className="rounded-xl font-semibold gap-2"
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isSaving ? m.saving : m.saveCard}
        </Button>
      </div>
    </form>
  );
}
