import Stripe from "stripe";
import { Context, Effect, Layer } from "effect";

import {
  ExternalServiceError,
  ForbiddenError,
  PayloadOperationError,
} from "../errors";
import { Payload } from "./payload";

// ── Types ───────────────────────────────────────────────────────────────────

export interface CardInfo {
  id: string;
  brand: string;
  last4: string;
  expMonth: number | undefined;
  expYear: number | undefined;
  isDefault: boolean;
  metadata: Stripe.Metadata | null;
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface PayloadUser {
  id: number;
  stripeCustomerId?: string | null;
}

// ── Service definition ──────────────────────────────────────────────────────

export interface StripeServiceInterface {
  /** Find or create a Stripe customer. Persists the Stripe ID to the user record. */
  readonly getOrCreateCustomer: (
    email: string,
    name?: string | null,
  ) => Effect.Effect<
    Stripe.Customer,
    ExternalServiceError | PayloadOperationError
  >;

  /** List card payment methods for a customer, including default flag. */
  readonly listPaymentMethods: (
    customerId: string,
    defaultPaymentMethodId: string | null,
  ) => Effect.Effect<CardInfo[], ExternalServiceError>;

  /** Create a SetupIntent for adding a new card. */
  readonly createSetupIntent: (
    customerId: string,
    metadata?: Record<string, string>,
  ) => Effect.Effect<{ clientSecret: string | null }, ExternalServiceError>;

  /** Set the default payment method for a customer. Verifies ownership. */
  readonly setDefaultPaymentMethod: (
    customerId: string,
    paymentMethodId: string,
  ) => Effect.Effect<void, ExternalServiceError | ForbiddenError>;

  /** Detach a payment method. Verifies ownership. */
  readonly detachPaymentMethod: (
    customerId: string,
    paymentMethodId: string,
  ) => Effect.Effect<void, ExternalServiceError | ForbiddenError>;

  /** Update metadata on a payment method. Verifies ownership. */
  readonly updatePaymentMethodMetadata: (
    customerId: string,
    paymentMethodId: string,
    metadata: Record<string, string>,
  ) => Effect.Effect<void, ExternalServiceError | ForbiddenError>;

  /** Retrieve a PaymentIntent. */
  readonly retrievePaymentIntent: (
    id: string,
  ) => Effect.Effect<Stripe.PaymentIntent, ExternalServiceError>;

  /** Update a PaymentIntent's amount and metadata. */
  readonly updatePaymentIntent: (
    id: string,
    params: { amount: number; metadata: Record<string, string> },
    idempotencyKey?: string,
  ) => Effect.Effect<Stripe.PaymentIntent, ExternalServiceError>;

  /** Look up existing Stripe customers by email. */
  readonly findCustomerByEmail: (
    email: string,
  ) => Effect.Effect<Stripe.Customer | null, ExternalServiceError>;
}

export class StripeService extends Context.Tag("Stripe")<
  StripeService,
  StripeServiceInterface
>() {}

// ── Live implementation ─────────────────────────────────────────────────────

export const StripeLive = Layer.effect(
  StripeService,
  Effect.gen(function* () {
    const db = yield* Payload;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });

    const stripeOp = <A>(
      operation: string,
      fn: () => Promise<A>,
    ): Effect.Effect<A, ExternalServiceError> =>
      Effect.tryPromise(fn).pipe(
        Effect.mapError(
          () => new ExternalServiceError({ service: "Stripe", operation }),
        ),
      );

    const verifyOwnership = (
      customerId: string,
      paymentMethodId: string,
    ): Effect.Effect<
      Stripe.PaymentMethod,
      ExternalServiceError | ForbiddenError
    > =>
      stripeOp("paymentMethods.retrieve", () =>
        stripe.paymentMethods.retrieve(paymentMethodId),
      ).pipe(
        Effect.flatMap((pm) =>
          pm.customer !== customerId
            ? Effect.fail(new ForbiddenError({ message: "Not authorized" }))
            : Effect.succeed(pm),
        ),
      );

    return StripeService.of({
      getOrCreateCustomer: (email, name) =>
        Effect.gen(function* () {
          const users = yield* db.find({
            collection: "users",
            where: { email: { equals: email } },
            limit: 1,
          });
          const payloadUser = users.docs[0] as PayloadUser | undefined;

          // Use stored Stripe customer ID if available
          if (payloadUser?.stripeCustomerId) {
            const stripeCustomerId = payloadUser.stripeCustomerId;
            const existing = yield* stripeOp("customers.retrieve", () =>
              stripe.customers.retrieve(stripeCustomerId),
            ).pipe(Effect.either);

            if (existing._tag === "Right") {
              const retrieved = existing.right;
              if (!("deleted" in retrieved && retrieved.deleted)) {
                return retrieved as Stripe.Customer;
              }
            }
            // Stored ID invalid — fall through to email lookup
          }

          // Fall back to email lookup
          const existingList = yield* stripeOp("customers.list", () =>
            stripe.customers.list({ email, limit: 1 }),
          );
          let customer = existingList.data[0];

          if (!customer) {
            customer = yield* stripeOp("customers.create", () =>
              stripe.customers.create({
                email,
                name: name || undefined,
              }),
            );
          }

          // Persist Stripe customer ID to user record (non-critical)
          if (payloadUser) {
            const raw = yield* db.raw;
            yield* Effect.tryPromise(() =>
              raw.update({
                collection: "users",
                id: payloadUser.id,
                data: { stripeCustomerId: customer.id },
              }),
            ).pipe(
              Effect.catchAll((error) =>
                Effect.sync(() => {
                  console.warn(
                    "Failed to persist Stripe customer ID to user record:",
                    error,
                  );
                }),
              ),
            );
          }

          return customer;
        }),

      listPaymentMethods: (customerId, defaultPaymentMethodId) =>
        stripeOp("paymentMethods.list", () =>
          stripe.paymentMethods.list({ customer: customerId, type: "card" }),
        ).pipe(
          Effect.map((result) =>
            result.data.map((pm) => ({
              id: pm.id,
              brand: pm.card?.brand ?? "unknown",
              last4: pm.card?.last4 ?? "****",
              expMonth: pm.card?.exp_month,
              expYear: pm.card?.exp_year,
              isDefault: pm.id === defaultPaymentMethodId,
              metadata: pm.metadata,
              billingAddress: {
                firstName: pm.metadata?.billing_firstName || "",
                lastName: pm.metadata?.billing_lastName || "",
                addressLine1: pm.metadata?.billing_addressLine1 || "",
                addressLine2: pm.metadata?.billing_addressLine2 || "",
                city: pm.metadata?.billing_city || "",
                state: pm.metadata?.billing_state || "",
                postalCode: pm.metadata?.billing_postalCode || "",
                country: pm.metadata?.billing_country || "",
              },
            })),
          ),
        ),

      createSetupIntent: (customerId, metadata) =>
        stripeOp("setupIntents.create", () =>
          stripe.setupIntents.create({
            customer: customerId,
            payment_method_types: ["card"],
            metadata: metadata ?? {},
          }),
        ).pipe(Effect.map((si) => ({ clientSecret: si.client_secret }))),

      setDefaultPaymentMethod: (customerId, paymentMethodId) =>
        verifyOwnership(customerId, paymentMethodId).pipe(
          Effect.flatMap(() =>
            stripeOp("customers.update", () =>
              stripe.customers.update(customerId, {
                invoice_settings: {
                  default_payment_method: paymentMethodId,
                },
              }),
            ),
          ),
          Effect.asVoid,
        ),

      detachPaymentMethod: (customerId, paymentMethodId) =>
        verifyOwnership(customerId, paymentMethodId).pipe(
          Effect.flatMap(() =>
            stripeOp("paymentMethods.detach", () =>
              stripe.paymentMethods.detach(paymentMethodId),
            ),
          ),
          Effect.asVoid,
        ),

      updatePaymentMethodMetadata: (customerId, paymentMethodId, metadata) =>
        verifyOwnership(customerId, paymentMethodId).pipe(
          Effect.flatMap(() =>
            stripeOp("paymentMethods.update", () =>
              stripe.paymentMethods.update(paymentMethodId, { metadata }),
            ),
          ),
          Effect.asVoid,
        ),

      retrievePaymentIntent: (id) =>
        stripeOp("paymentIntents.retrieve", () =>
          stripe.paymentIntents.retrieve(id),
        ),

      updatePaymentIntent: (id, params, idempotencyKey) =>
        stripeOp("paymentIntents.update", () =>
          stripe.paymentIntents.update(
            id,
            {
              amount: params.amount,
              metadata: params.metadata,
            },
            idempotencyKey ? { idempotencyKey } : undefined,
          ),
        ),

      findCustomerByEmail: (email) =>
        stripeOp("customers.list", () =>
          stripe.customers.list({ email, limit: 1 }),
        ).pipe(Effect.map((result) => result.data[0] ?? null)),
    });
  }),
);
