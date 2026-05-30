/**
 * Payment provider adapter interface (per ADR-0004).
 *
 * Day-1 implementations: Stripe (cards), CashOnPickup. Future adapters:
 * Paymob, Fawry, Vodafone Cash, Instapay. Each provider declares the
 * fulfillment modes it supports — dine-in MUST pre-pay online, so
 * CashOnPickup is hard-blocked for dine-in.
 *
 * The provider is selected at cart-confirmation time by intersecting:
 *   1. The branch's `allowedPaymentProviders` setting.
 *   2. The cart's `fulfillmentMode`.
 *   3. The guest's explicit selection in the UI.
 */

import type { FulfillmentMode } from "./fulfillment";

export const PAYMENT_PROVIDER_IDS = [
  "stripe",
  "cash-on-pickup",
  "paymob",
  "fawry",
] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDER_IDS)[number];

export interface CreateIntentInput {
  readonly cartId: string | number;
  readonly amount: number;
  readonly currency: string;
  readonly customerId?: string;
  readonly metadata?: Record<string, string>;
}

export interface CreateIntentResult {
  readonly intentId: string;
  readonly clientSecret?: string;
  readonly status: "requires_action" | "succeeded" | "pending";
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  readonly allowedFulfillmentModes: ReadonlySet<FulfillmentMode>;
  /** True if this provider settles online before the kitchen sees the ticket. */
  readonly settlesUpfront: boolean;
  readonly createIntent: (input: CreateIntentInput) => Promise<CreateIntentResult>;
}

// ── Built-in adapters ──────────────────────────────────────────────────────

export const stripeProviderDescriptor = {
  id: "stripe" as const,
  allowedFulfillmentModes: new Set<FulfillmentMode>([
    "dine-in",
    "pickup",
    "delivery",
    "merch",
  ]),
  settlesUpfront: true,
};

export const cashOnPickupProviderDescriptor = {
  id: "cash-on-pickup" as const,
  // Pickup-only (per GOAL §9 / ADR-0004). Dine-in MUST pre-pay.
  allowedFulfillmentModes: new Set<FulfillmentMode>(["pickup"]),
  settlesUpfront: false,
};

/**
 * Validate that a chosen provider id is allowed for the given fulfillment
 * mode and branch settings. Returns the matching descriptor or null with a
 * reason. Callers translate `null` into a `PaymentProviderNotAllowedError`.
 */
export function pickPaymentProvider(input: {
  readonly chosenProviderId: PaymentProviderId;
  readonly fulfillmentMode: FulfillmentMode;
  readonly branchAllowedProviders: ReadonlyArray<PaymentProviderId>;
}): { ok: true; provider: typeof stripeProviderDescriptor | typeof cashOnPickupProviderDescriptor }
  | { ok: false; reason: "not-allowed-at-branch" | "wrong-fulfillment-mode" | "unknown-provider" } {
  if (!input.branchAllowedProviders.includes(input.chosenProviderId)) {
    return { ok: false, reason: "not-allowed-at-branch" };
  }

  const descriptor =
    input.chosenProviderId === "stripe"
      ? stripeProviderDescriptor
      : input.chosenProviderId === "cash-on-pickup"
        ? cashOnPickupProviderDescriptor
        : null;

  if (!descriptor) {
    return { ok: false, reason: "unknown-provider" };
  }

  if (!descriptor.allowedFulfillmentModes.has(input.fulfillmentMode)) {
    return { ok: false, reason: "wrong-fulfillment-mode" };
  }

  return { ok: true, provider: descriptor };
}
