import { Effect, Either } from "effect";
import { headers } from "next/headers";

import {
  handleRoute,
  ok,
  Auth,
  AppLive,
  parseBody,
  ForbiddenError,
  ValidationError,
} from "@/lib/effect";
import { checkRateLimit } from "@/lib/effect/rate-limit";
import { Discount } from "@/lib/effect/services/discount";
import { StripeService } from "@/lib/effect/services/stripe";

import { PaymentAmountRequestSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      // Rate limit by IP
      const headersList = yield* Effect.tryPromise(() => headers()).pipe(
        Effect.orDie,
      );
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

      yield* checkRateLimit({ key: ip, maxRequests: 20, windowMs: 60_000 });

      const auth = yield* Auth;
      const stripeService = yield* StripeService;
      const discountService = yield* Discount;

      // Try to get session (optional -- guests are allowed)
      const sessionResult = yield* Effect.either(auth.requireUser);
      const sessionUser = Either.isRight(sessionResult)
        ? sessionResult.right
        : null;

      const { paymentIntentId, discountCode } = yield* parseBody(
        PaymentAmountRequestSchema,
        req,
      );

      // Retrieve payment intent from Stripe
      const paymentIntent =
        yield* stripeService.retrievePaymentIntent(paymentIntentId);

      // SECURITY: Only allow amount changes if payment is still in initial state
      if (paymentIntent.status !== "requires_payment_method") {
        return yield* new ValidationError({
          message:
            "Cannot modify payment amount after payment has been initiated",
          details: {
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        });
      }

      // For logged-in users, verify the payment intent belongs to them
      if (sessionUser) {
        const customer = yield* stripeService.findCustomerByEmail(
          sessionUser.email,
        );
        if (!customer || paymentIntent.customer !== customer.id) {
          return yield* new ForbiddenError({ message: "Not authorized" });
        }
      } else {
        // For guest users, ensure payment intent exists and has a customer
        if (!paymentIntent.customer) {
          return yield* new ValidationError({
            message: "Invalid payment intent",
            details: {},
          });
        }
      }

      let finalAmount = paymentIntent.amount;
      let discountAmount = 0;

      // Apply discount if a valid code is provided
      if (discountCode) {
        // Use the original amount (before any prior discount) as the base
        const parsed = paymentIntent.metadata?.originalAmount
          ? parseInt(paymentIntent.metadata.originalAmount, 10)
          : NaN;
        const baseAmount =
          Number.isFinite(parsed) && parsed > 0 ? parsed : paymentIntent.amount;

        const result = yield* discountService.validate({
          code: discountCode,
          subtotal: baseAmount,
          customerEmail: sessionUser?.email ?? null,
        });

        discountAmount = result.discountAmount;
        finalAmount = baseAmount - discountAmount;

        // Update the Stripe PaymentIntent with the discounted amount
        yield* stripeService.updatePaymentIntent(
          paymentIntentId,
          {
            amount: finalAmount,
            metadata: {
              ...paymentIntent.metadata,
              discountCode: result.code,
              discountId: String(result.discountId),
              discountAmount: String(discountAmount),
              originalAmount: String(baseAmount),
            },
          },
          `discount-apply-${paymentIntentId}-${result.code}`,
        );
      }

      return ok({
        amount: finalAmount,
        currency: paymentIntent.currency,
        discountAmount,
      });
    }).pipe(Effect.provide(AppLive)),
  );
