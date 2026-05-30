"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultCountries } from "@payloadcms/plugin-ecommerce/client/react";
import { AuthPrompt } from "./auth-prompt";
import type { Address } from "@/payload-types";
import type { Messages } from "@/lib/i18n";

interface CheckoutFormProps {
  onSubmit: (data: {
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
  }) => Promise<void>;
  isLoading: boolean;
  defaultEmail: string;
  userName?: string | null;
  isLoggedIn: boolean;
  defaultAddress?: Address | null;
  translations: Messages<"checkout">;
}

export function CheckoutForm({
  onSubmit,
  isLoading,
  defaultEmail,
  userName,
  isLoggedIn,
  defaultAddress,
  translations: m,
}: CheckoutFormProps) {
  const [guestEmail, setGuestEmail] = useState(defaultEmail);
  // For logged-in users, always use the prop directly so it updates when user loads
  const email = isLoggedIn ? defaultEmail : guestEmail;

  // Initialize form fields with defaultAddress if available
  const [firstName, setFirstName] = useState(
    () => defaultAddress?.firstName ?? "",
  );
  const [lastName, setLastName] = useState(
    () => defaultAddress?.lastName ?? "",
  );
  const [addressLine1, setAddressLine1] = useState(
    () => defaultAddress?.addressLine1 ?? "",
  );
  const [addressLine2, setAddressLine2] = useState(
    () => defaultAddress?.addressLine2 ?? "",
  );
  const [city, setCity] = useState(() => defaultAddress?.city ?? "");
  const [state, setState] = useState(() => defaultAddress?.state ?? "");
  const [postalCode, setPostalCode] = useState(
    () => defaultAddress?.postalCode ?? "",
  );
  const [country, setCountry] = useState<string>(
    () => defaultAddress?.country ?? "US",
  );
  const [saveAddress, setSaveAddress] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      email,
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      saveAddress,
    });
  };

  return (
    <>
      <AuthPrompt
        isLoggedIn={isLoggedIn}
        userName={userName}
        translations={m}
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            {m.contactInformation}
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">{m.emailAddress}</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder={m.emailPlaceholder}
                className="mt-1.5"
                disabled={isLoggedIn}
              />
              {isLoggedIn && (
                <p className="text-xs text-muted-foreground mt-1">
                  {m.usingAccountEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
            {m.shippingAddress}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{m.firstName}</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={m.firstNamePlaceholder}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="lastName">{m.lastName}</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={m.lastNamePlaceholder}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addressLine1">{m.address}</Label>
              <Input
                id="addressLine1"
                type="text"
                required
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder={m.addressPlaceholder}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">
                {m.addressLine2}{" "}
                <span className="text-muted-foreground font-normal">
                  {m.optional}
                </span>
              </Label>
              <Input
                id="addressLine2"
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder={m.addressLine2Placeholder}
                className="mt-1.5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">{m.city}</Label>
                <Input
                  id="city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={m.cityPlaceholder}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="state">{m.stateProvince}</Label>
                <Input
                  id="state"
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder={m.statePlaceholder}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">{m.postalCode}</Label>
                <Input
                  id="postalCode"
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder={m.postalCodePlaceholder}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">{m.country}</Label>
              <select
                id="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
              >
                {defaultCountries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoggedIn && (
            <label className="flex items-center gap-2.5 cursor-pointer group mt-2">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="size-4 rounded border-input accent-primary cursor-pointer"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {m.saveAddressForFutureOrders}
              </span>
            </label>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-12 text-base font-semibold gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              {m.processing}
            </>
          ) : (
            <>
              <Lock className="size-4" />
              {m.continueToPayment}
            </>
          )}
        </Button>
      </form>
    </>
  );
}
