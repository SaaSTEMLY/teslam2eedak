/**
 * Pure cart-total math for restaurant orders.
 *
 * All amounts are integers in **qirsh** (1/100 EGP), the same convention
 * Stripe and the plugin-ecommerce schema use for `priceInUSD`. The currency
 * label is decided per-restaurant; this module is currency-agnostic.
 *
 * Service charge applies to dine-in carts only (per GOAL §10 and ADR-0005).
 * VAT applies to every fulfillment mode.
 * Tip is a guest-discretionary add-on on top of the grand total, separate
 * from the auto-added service charge.
 *
 * Snapshot the resolved rates on the Order at creation time (ADR-0003)
 * so historical orders are immutable to later rate changes.
 */

import type { FulfillmentMode } from "./fulfillment";

export interface CartLineItem {
  /** Pre-tax, pre-discount line total in qirsh. Should already include
   * size-variant pricing and any selected modifier price deltas × quantity. */
  readonly amount: number;
}

export interface CartTotalsInput {
  readonly lineItems: ReadonlyArray<CartLineItem>;
  readonly fulfillmentMode: FulfillmentMode;
  /** VAT rate as a percent (e.g. 14 for 14%). */
  readonly vatPercent: number;
  /** Service charge rate as a percent (e.g. 12 for 12%). Applied only
   * when fulfillmentMode === 'dine-in'. */
  readonly serviceChargePercent: number;
  /** Discount in qirsh applied to the subtotal before VAT/service. */
  readonly discountAmount?: number;
  /** Guest-discretionary tip in qirsh, added on top of the grand total. */
  readonly tipAmount?: number;
}

export interface CartTotals {
  readonly subtotal: number;
  readonly discountAmount: number;
  readonly taxableBase: number;
  readonly vatAmount: number;
  readonly serviceChargeAmount: number;
  readonly tipAmount: number;
  readonly grandTotal: number;
}

const roundQirsh = (n: number) => Math.round(n);
const nonNegative = (n: number) => (n < 0 ? 0 : n);

export function computeCartTotals(input: CartTotalsInput): CartTotals {
  const subtotal = input.lineItems.reduce((sum, li) => sum + li.amount, 0);
  const discountAmount = nonNegative(
    Math.min(input.discountAmount ?? 0, subtotal),
  );
  const taxableBase = subtotal - discountAmount;

  const vatAmount = roundQirsh((taxableBase * input.vatPercent) / 100);

  const serviceChargeAmount =
    input.fulfillmentMode === "dine-in"
      ? roundQirsh((taxableBase * input.serviceChargePercent) / 100)
      : 0;

  const tipAmount = nonNegative(input.tipAmount ?? 0);

  const grandTotal =
    taxableBase + vatAmount + serviceChargeAmount + tipAmount;

  return {
    subtotal,
    discountAmount,
    taxableBase,
    vatAmount,
    serviceChargeAmount,
    tipAmount,
    grandTotal,
  };
}
