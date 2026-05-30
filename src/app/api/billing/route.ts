import { Effect } from "effect";
import type { z } from "zod/v4";

import {
  handleRoute,
  ok,
  Auth,
  Payload,
  AppLive,
  parseBody,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/lib/effect";
import { StripeService } from "@/lib/effect/services/stripe";

import { BillingPostRequestSchema } from "./schema";

type BillingPostBody = z.infer<typeof BillingPostRequestSchema>;
type BillingPostResponse =
  | { clientSecret: string | null }
  | { success: boolean };

// ── GET: List payment methods ──────────────────────────────────────────────

export const GET = () =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const stripe = yield* StripeService;
      const user = yield* auth.requireUser;

      const customer = yield* stripe.getOrCreateCustomer(user.email, user.name);

      const defaultPaymentMethodId =
        typeof customer.invoice_settings?.default_payment_method === "string"
          ? customer.invoice_settings.default_payment_method
          : (customer.invoice_settings?.default_payment_method?.id ?? null);

      const cards = yield* stripe.listPaymentMethods(
        customer.id,
        defaultPaymentMethodId,
      );

      return ok({ cards });
    }).pipe(Effect.provide(AppLive)),
  );

// ── POST: Create SetupIntent or set default payment method ─────────────────

export const POST = (req: Request) =>
  handleRoute<BillingPostResponse>(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const stripeService = yield* StripeService;
      const user = yield* auth.requireUser;

      const body: BillingPostBody = yield* parseBody(
        BillingPostRequestSchema,
        req,
      );

      const customer = yield* stripeService.getOrCreateCustomer(
        user.email,
        user.name,
      );

      switch (body.action) {
        case "setup-intent": {
          const result = yield* stripeService.createSetupIntent(customer.id, {
            alias: body.alias || "",
          });
          return ok({ clientSecret: result.clientSecret });
        }

        case "set-default": {
          yield* stripeService.setDefaultPaymentMethod(
            customer.id,
            body.paymentMethodId,
          );
          return ok({ success: true });
        }

        case "update-transaction-billing": {
          const db = yield* Payload;
          const payloadUser = yield* db.findUserByEmail(user.email);

          const transactions = yield* db.find({
            collection: "transactions",
            where: {
              "stripe.paymentIntentID": { equals: body.paymentIntentId },
            },
            limit: 1,
          });

          const transaction = transactions.docs[0] as
            | {
                id: string | number;
                customer: number | { id: number };
              }
            | undefined;

          if (!transaction) {
            return yield* new NotFoundError({
              resource: "Transaction",
              id: body.paymentIntentId,
            });
          }

          const txCustomerId =
            typeof transaction.customer === "number"
              ? transaction.customer
              : transaction.customer?.id;
          if (txCustomerId !== payloadUser.id) {
            return yield* new ForbiddenError({ message: "Not authorized" });
          }

          const paymentIntent = yield* stripeService.retrievePaymentIntent(
            body.paymentIntentId,
          );

          if (paymentIntent.customer !== customer.id) {
            return yield* new ForbiddenError({ message: "Not authorized" });
          }

          yield* db.update({
            collection: "transactions",
            id: transaction.id,
            data: {
              billingAddress: {
                firstName: body.billingAddress.firstName || undefined,
                lastName: body.billingAddress.lastName || undefined,
                addressLine1: body.billingAddress.addressLine1 || undefined,
                addressLine2: body.billingAddress.addressLine2 || undefined,
                city: body.billingAddress.city || undefined,
                state: body.billingAddress.state || undefined,
                postalCode: body.billingAddress.postalCode || undefined,
                country: body.billingAddress.country || undefined,
              },
            },
          });

          return ok({ success: true });
        }

        case "update-metadata": {
          const metadata: Record<string, string> = {
            alias: body.alias || "",
          };

          if (body.billingAddress) {
            metadata.billing_firstName = body.billingAddress.firstName || "";
            metadata.billing_lastName = body.billingAddress.lastName || "";
            metadata.billing_addressLine1 =
              body.billingAddress.addressLine1 || "";
            metadata.billing_addressLine2 =
              body.billingAddress.addressLine2 || "";
            metadata.billing_city = body.billingAddress.city || "";
            metadata.billing_state = body.billingAddress.state || "";
            metadata.billing_postalCode = body.billingAddress.postalCode || "";
            metadata.billing_country = body.billingAddress.country || "";
          }

          yield* stripeService.updatePaymentMethodMetadata(
            customer.id,
            body.paymentMethodId,
            metadata,
          );

          return ok({ success: true });
        }
      }
    }).pipe(Effect.provide(AppLive)),
  );

// ── DELETE: Detach a payment method ────────────────────────────────────────

export const DELETE = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const stripeService = yield* StripeService;
      const user = yield* auth.requireUser;

      const { searchParams } = new URL(req.url);
      const paymentMethodId = searchParams.get("id");

      if (!paymentMethodId) {
        return yield* new ValidationError({
          message: "Payment method ID is required",
          details: {},
        });
      }

      const customer = yield* stripeService.getOrCreateCustomer(
        user.email,
        user.name,
      );

      yield* stripeService.detachPaymentMethod(customer.id, paymentMethodId);

      return ok({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
