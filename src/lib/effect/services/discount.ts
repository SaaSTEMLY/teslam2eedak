import { Context, Effect, Layer } from "effect";

import {
  InvalidDiscountError,
  PaymentError,
  PayloadOperationError,
} from "../errors";
import { Payload } from "./payload";

// ── Types ───────────────────────────────────────────────────────────────────

export interface DiscountValidationResult {
  discountId: number;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number | null;
  maxDiscountAmount: number | null;
  discountAmount: number;
}

interface DiscountRecord {
  id: number;
  code: string;
  isActive: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  maxUses?: number | null;
  currentUses?: number | null;
  maxUsesPerCustomer?: number | null;
  minimumOrderAmount?: number | null;
  discountType: "percentage" | "flat";
  discountValue?: number | null;
  maxDiscountAmount?: number | null;
}

// ── Service definition ──────────────────────────────────────────────────────

export interface DiscountServiceInterface {
  /**
   * Validate a discount code and calculate the discount amount.
   * Checks: existence, active status, date range, global usage limit,
   * per-customer usage limit, minimum order amount.
   */
  readonly validate: (opts: {
    code: string;
    subtotal?: number | null;
    customerEmail?: string | null;
  }) => Effect.Effect<
    DiscountValidationResult,
    InvalidDiscountError | PaymentError | PayloadOperationError
  >;

  /**
   * Calculate discount amount given a base amount and discount parameters.
   * Pure computation — no DB calls.
   */
  readonly calculateAmount: (opts: {
    baseAmount: number;
    discountType: "percentage" | "flat";
    discountValue: number;
    maxDiscountAmount?: number | null;
  }) => number;
}

export class Discount extends Context.Tag("Discount")<
  Discount,
  DiscountServiceInterface
>() {}

// ── Pure helpers ────────────────────────────────────────────────────────────

function computeDiscountAmount(opts: {
  baseAmount: number;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscountAmount?: number | null;
}): number {
  let amount: number;

  if (opts.discountType === "percentage") {
    amount = Math.round((opts.baseAmount * opts.discountValue) / 100);
    if (
      opts.maxDiscountAmount != null &&
      opts.maxDiscountAmount > 0 &&
      amount > opts.maxDiscountAmount
    ) {
      amount = opts.maxDiscountAmount;
    }
  } else {
    amount = opts.discountValue;
  }

  // Never discount more than the base
  if (amount > opts.baseAmount) {
    amount = opts.baseAmount;
  }

  return amount;
}

// ── Live implementation ─────────────────────────────────────────────────────

export const DiscountLive = Layer.effect(
  Discount,
  Effect.gen(function* () {
    const db = yield* Payload;

    return Discount.of({
      calculateAmount: computeDiscountAmount,

      validate: ({ code, subtotal, customerEmail }) =>
        Effect.gen(function* () {
          const normalizedCode = code.toUpperCase().trim();

          // Look up the discount code
          const discountResult = yield* db.find({
            collection: "discount-codes",
            where: { code: { equals: normalizedCode } },
            limit: 1,
            depth: 0,
          });

          const discount = discountResult.docs[0] as DiscountRecord | undefined;

          if (!discount) {
            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: "Invalid discount code",
            });
          }

          if (!discount.isActive) {
            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: "Invalid discount code",
            });
          }

          // Check date validity
          const now = new Date();
          if (discount.validFrom && new Date(discount.validFrom) > now) {
            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: "Invalid discount code",
            });
          }
          if (discount.validUntil && new Date(discount.validUntil) < now) {
            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: "This discount code has expired",
            });
          }

          // Check global usage limit
          if (
            discount.maxUses != null &&
            discount.maxUses > 0 &&
            (discount.currentUses ?? 0) >= discount.maxUses
          ) {
            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: "This discount code has reached its usage limit",
            });
          }

          // Check per-customer usage
          if (
            discount.maxUsesPerCustomer != null &&
            discount.maxUsesPerCustomer > 0 &&
            customerEmail
          ) {
            const customerOrders = yield* db.find({
              collection: "orders",
              where: {
                and: [
                  { customerEmail: { equals: customerEmail } },
                  { discountCode: { equals: discount.code } },
                ],
              },
              limit: 0,
              depth: 0,
            });

            if (customerOrders.totalDocs >= discount.maxUsesPerCustomer) {
              return yield* new InvalidDiscountError({
                code: normalizedCode,
                reason:
                  "You have already used this discount code the maximum number of times",
              });
            }
          }

          // Check minimum order amount
          if (
            discount.minimumOrderAmount != null &&
            discount.minimumOrderAmount > 0 &&
            subtotal != null &&
            subtotal < discount.minimumOrderAmount
          ) {
            const minFormatted = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(discount.minimumOrderAmount / 100);

            return yield* new InvalidDiscountError({
              code: normalizedCode,
              reason: `Minimum order amount of ${minFormatted} required`,
            });
          }

          // Calculate discount amount
          let discountAmount = 0;
          if (subtotal != null && subtotal > 0) {
            discountAmount = computeDiscountAmount({
              baseAmount: subtotal,
              discountType: discount.discountType,
              discountValue: discount.discountValue ?? 0,
              maxDiscountAmount: discount.maxDiscountAmount,
            });
          }

          return {
            discountId: discount.id,
            code: discount.code,
            discountType: discount.discountType,
            discountValue: discount.discountValue ?? null,
            maxDiscountAmount: discount.maxDiscountAmount ?? null,
            discountAmount,
          };
        }),
    });
  }),
);
