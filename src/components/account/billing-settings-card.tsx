"use client";

import { useState, useCallback } from "react";
import {
  CreditCard,
  Loader2,
  Check,
  ShieldCheck,
  Plus,
  Package,
} from "lucide-react";
import { useAddresses } from "@payloadcms/plugin-ecommerce/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { defaultCountries } from "@payloadcms/plugin-ecommerce/client/react";
import { toast } from "sonner";
import { AddCardDialog } from "@/components/shared/add-card-dialog";
import { SavedCardsManager } from "@/components/shared/saved-cards-manager";
import type { Address } from "@/payload-types";
import type accountEn from "@/messages/account/en";
import type addCardDialogEn from "@/messages/add-card-dialog/en";

type SaveState = "idle" | "saving" | "saved" | "error";

export function BillingSettingsCard({
  translations,
  addCardTranslations,
  locale,
}: {
  translations: typeof accountEn;
  addCardTranslations: typeof addCardDialogEn;
  locale: string;
}) {
  return (
    <div className="grid gap-6">
      <ShippingAddressCard translations={translations} locale={locale} />
      <PaymentMethodsCard
        translations={translations}
        addCardTranslations={addCardTranslations}
        locale={locale}
      />
    </div>
  );
}

// ─── Shipping Address Card ──────────────────────────────────────────

function ShippingAddressCard({
  translations,
}: {
  translations: typeof accountEn;
  locale: string;
}) {
  const { addresses, createAddress, updateAddress, isLoading } =
    useAddresses<Address>();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [existingAddressId, setExistingAddressId] = useState<number | null>(
    null,
  );

  // Sync address fields when addresses load (render-time state adjustment)
  const [prevAddresses, setPrevAddresses] = useState(addresses);
  if (addresses !== prevAddresses) {
    setPrevAddresses(addresses);
    if (addresses && addresses.length > 0) {
      const existing = addresses[0]!;
      setExistingAddressId(existing.id);
      setAddress({
        firstName: existing.firstName ?? "",
        lastName: existing.lastName ?? "",
        addressLine1: existing.addressLine1 ?? "",
        addressLine2: existing.addressLine2 ?? "",
        city: existing.city ?? "",
        state: existing.state ?? "",
        postalCode: existing.postalCode ?? "",
        country: existing.country ?? "US",
      });
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaveState("saving");

    try {
      if (existingAddressId) {
        await updateAddress(existingAddressId, {
          firstName: address.firstName,
          lastName: address.lastName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        });
      } else {
        await createAddress({
          firstName: address.firstName,
          lastName: address.lastName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        });
      }

      setSaveState("saved");
      toast.success(translations.shippingAddressUpdated);
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      toast.error(translations.failedToUpdateAddress);
      setTimeout(() => setSaveState("idle"), 2000);
    }
  }

  return (
    <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
            <Package className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="font-serif text-lg">
              {translations.shippingAddressTitle}
            </CardTitle>
            <CardDescription className="text-sm">
              {translations.shippingAddressDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium">
                  {translations.firstName}
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={address.firstName}
                  onChange={handleChange}
                  placeholder={translations.firstNamePlaceholder}
                  className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium">
                  {translations.lastName}
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={address.lastName}
                  onChange={handleChange}
                  placeholder={translations.lastNamePlaceholder}
                  className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addressLine1" className="text-xs font-medium">
                {translations.address}
              </Label>
              <Input
                id="addressLine1"
                name="addressLine1"
                value={address.addressLine1}
                onChange={handleChange}
                placeholder={translations.addressPlaceholder}
                className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addressLine2" className="text-xs font-medium">
                {translations.addressLine2}{" "}
                <span className="text-muted-foreground">
                  ({translations.optional})
                </span>
              </Label>
              <Input
                id="addressLine2"
                name="addressLine2"
                value={address.addressLine2}
                onChange={handleChange}
                placeholder={translations.addressLine2Placeholder}
                className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-medium">
                  {translations.city}
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={address.city}
                  onChange={handleChange}
                  placeholder={translations.cityPlaceholder}
                  className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-medium">
                  {translations.stateProvince}
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={address.state}
                  onChange={handleChange}
                  placeholder={translations.statePlaceholder}
                  className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-xs font-medium">
                  {translations.postalCode}
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleChange}
                  placeholder={translations.postalCodePlaceholder}
                  className="h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-xs font-medium">
                {translations.country}
              </Label>
              <select
                id="country"
                name="country"
                value={address.country}
                onChange={handleChange}
                className="flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm shadow-xs transition-all duration-200 outline-none focus:border-primary/50 focus:ring-primary/20 focus:ring-4"
              >
                {defaultCountries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="bg-muted/30 border-t border-border/50 px-6 py-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {translations.addressPrefilledNote}
        </p>
        <Button
          onClick={handleSave}
          disabled={
            saveState === "saving" || saveState === "saved" || isLoading
          }
          className="rounded-xl font-semibold gap-2"
        >
          {saveState === "saving" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {translations.saving}
            </>
          ) : saveState === "saved" ? (
            <>
              <Check className="size-4" />
              {translations.saved}
            </>
          ) : (
            translations.saveAddress
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Payment Methods Card ───────────────────────────────────────────

function PaymentMethodsCard({
  translations,
  addCardTranslations,
}: {
  translations: typeof accountEn;
  addCardTranslations: typeof addCardDialogEn;
  locale: string;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddNew = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleCardAdded = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  return (
    <>
      <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
                <CreditCard className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-lg">
                  {translations.paymentMethodsTitle}
                </CardTitle>
                <CardDescription className="text-sm">
                  {translations.paymentMethodsDescription}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNew}
              className="rounded-xl gap-1.5 shrink-0"
            >
              <Plus className="size-3.5" />
              {translations.addCard}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <SavedCardsManager
            mode="list"
            onSetDefault={() => {}}
            onAddNewCard={handleAddNew}
            translations={{
              endingIn: translations.endingIn,
              expires: translations.expires,
              defaultCardBadge: translations.defaultCard,
              edit: translations.editCard,
              remove: translations.remove,
              setAsDefault: translations.setAsDefault,
              addCard: translations.addCard,
              noCardsTitle: translations.noCardsTitle,
              noCardsDescription: translations.noCardsDescription,
              editCardTitle: translations.editCard,
              editCardDescription: translations.editCardDescription,
              cardNickname: translations.cardNickname,
              cardNicknamePlaceholder: translations.cardNicknamePlaceholder,
              billingAddress: translations.billingAddress,
              firstName: translations.firstName,
              firstNamePlaceholder: translations.firstNamePlaceholder,
              lastName: translations.lastName,
              lastNamePlaceholder: translations.lastNamePlaceholder,
              address: translations.address,
              addressPlaceholder: translations.addressPlaceholder,
              addressLine2: translations.addressLine2,
              addressLine2Placeholder: translations.addressLine2Placeholder,
              city: translations.city,
              cityPlaceholder: translations.cityPlaceholder,
              state: translations.stateProvince,
              statePlaceholder: translations.statePlaceholder,
              postalCode: translations.postalCode,
              postalCodePlaceholder: translations.postalCodePlaceholder,
              country: translations.country,
              cancel: translations.cancel,
              save: translations.updateCard,
              saving: translations.saving,
              removeCardTitle: translations.confirmRemoveTitle,
              removeCardDescription: translations.confirmRemoveDescription,
              removeCardDescriptionNoAlias: `${translations.confirmRemoveDescription} {brand} ••{last4}${translations.confirmRemoveWarning}`,
              removeCardButton: translations.remove,
              removing: translations.removing,
              toastCardUpdated: translations.cardUpdated,
              toastCardUpdateFailed: translations.failedToUpdateCard,
              toastCardRemoved: translations.paymentMethodRemoved,
              toastCardRemoveFailed: translations.failedToRemoveCard,
              toastDefaultUpdated: translations.defaultPaymentMethodUpdated,
              toastDefaultFailed: translations.failedToSetDefault,
              toastLoadFailed: translations.failedToLoadPaymentMethods,
            }}
          />
        </CardContent>

        <CardFooter className="bg-muted/30 border-t border-border/50 px-6 py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {translations.paymentSecurityNote}
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Add Card Dialog (shared component) */}
      <AddCardDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCardAdded={handleCardAdded}
        translations={addCardTranslations}
      />
    </>
  );
}
