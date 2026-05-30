/**
 * Pure transition rules for an order's payment status.
 *
 * pending → paid    : staff marks cash settled, or Stripe webhook confirms.
 * pending → refunded: order cancelled before payment, treated as nothing-owed.
 * paid    → refunded: staff issues a refund (Stripe refund or cash from till).
 * refunded → *      : terminal.
 */

export const PAYMENT_STATUSES = ["pending", "paid", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const ALLOWED: Record<PaymentStatus, ReadonlyArray<PaymentStatus>> = {
  pending: ["paid", "refunded"],
  paid: ["refunded"],
  refunded: [],
};

export type PaymentTransitionError =
  | { kind: "terminal"; from: PaymentStatus }
  | { kind: "not-allowed"; from: PaymentStatus; to: PaymentStatus }
  | { kind: "same-state"; status: PaymentStatus };

export function validatePaymentTransition(
  from: PaymentStatus,
  to: PaymentStatus,
): PaymentTransitionError | null {
  if (from === to) return { kind: "same-state", status: from };
  if (ALLOWED[from].length === 0) return { kind: "terminal", from };
  if (!ALLOWED[from].includes(to)) return { kind: "not-allowed", from, to };
  return null;
}

export function nextAllowedPaymentStatuses(
  from: PaymentStatus,
): ReadonlyArray<PaymentStatus> {
  return ALLOWED[from];
}
