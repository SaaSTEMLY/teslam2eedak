/**
 * Pure helper: decide whether a place-order request needs a Stripe
 * PaymentIntent created server-side, and if so, build the metadata.
 *
 * Cash-on-pickup doesn't get an intent (settled at handover by staff
 * via the Live Orders Board). Stripe-card pays upfront.
 *
 * Stripe metadata can only carry string values; we serialize the
 * relevant order context so the webhook can correlate back to our
 * Order row without a roundtrip.
 */

import type { FulfillmentMode } from "./fulfillment";
import type { PaymentProviderId } from "./payment-provider";

export interface IntentDecisionInput {
  readonly providerId: PaymentProviderId;
  readonly providerSettlesUpfront: boolean;
  readonly amountQirsh: number;
  readonly orderId: string | number;
  readonly fulfillmentMode: FulfillmentMode;
  readonly locationId: string | number;
  readonly tableId: string | number | null;
}

export interface IntentDecision {
  readonly shouldCreate: boolean;
  readonly amount: number;
  readonly currency: string;
  readonly metadata: Record<string, string>;
  readonly idempotencyKey: string;
}

export function decidePaymentIntent(
  input: IntentDecisionInput,
): IntentDecision {
  const shouldCreate =
    input.providerSettlesUpfront && input.providerId !== "cash-on-pickup";
  return {
    shouldCreate,
    amount: input.amountQirsh,
    currency: "egp",
    metadata: {
      orderId: String(input.orderId),
      fulfillmentMode: input.fulfillmentMode,
      locationId: String(input.locationId),
      ...(input.tableId !== null
        ? { tableId: String(input.tableId) }
        : {}),
      restaurantId: "kk-main",
    },
    idempotencyKey: `kk-order-${input.orderId}-${input.amountQirsh}`,
  };
}
