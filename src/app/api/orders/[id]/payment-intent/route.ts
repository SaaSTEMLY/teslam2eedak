import { Effect } from "effect";

import {
  AppLive,
  Payload,
  NotFoundError,
  StripeService,
  ValidationError,
  handleRoute,
  ok,
} from "@/lib/effect";

/**
 * GET /api/orders/:id/payment-intent
 *
 * Returns the Stripe client_secret + amount/currency for the QR-pay
 * page to mount Stripe Elements. Anonymous — the client_secret is
 * scoped to one intent so disclosure isn't a vector. Returns 404 when
 * no payment intent exists (e.g., cash-on-pickup orders) so the page
 * can redirect to the tracker.
 */
export const GET = (
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const { id } = yield* Effect.tryPromise({
        try: () => ctx.params,
        catch: () =>
          new NotFoundError({ resource: "order", id: "missing-param" }),
      });
      const orderId = /^\d+$/.test(id) ? Number(id) : id;

      const db = yield* Payload;
      const order = yield* db.findByID({ collection: "orders", id: orderId });
      const o = order as {
        id: string | number;
        amount?: number;
        currency?: string;
        paymentIntentId?: string;
      };
      if (!o.paymentIntentId) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "payment-intent",
            id: String(orderId),
          }),
        );
      }

      const stripe = yield* StripeService;
      const intent = yield* stripe.retrievePaymentIntent(o.paymentIntentId);
      if (!intent.client_secret) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Payment intent has no client_secret",
            details: { intentId: intent.id, status: intent.status },
          }),
        );
      }

      return ok({
        orderId,
        amountQirsh: o.amount ?? intent.amount,
        currency: o.currency ?? intent.currency.toUpperCase(),
        clientSecret: intent.client_secret,
      });
    }).pipe(Effect.provide(AppLive)),
  );
