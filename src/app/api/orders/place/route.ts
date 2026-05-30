import { Effect } from "effect";

import {
  AppLive,
  Payload,
  StripeService,
  ValidationError,
  NotFoundError,
  PaymentProviderNotAllowedError,
  TableInactiveError,
  created,
  handleRoute,
  parseBody,
} from "@/lib/effect";
import { computeCartTotals } from "@/lib/ordering/totals";
import { pickPaymentProvider } from "@/lib/ordering/payment-provider";
import { decidePaymentIntent } from "@/lib/ordering/payment-intent";

import { placeOrderSchema } from "./schema";

interface ResolvedContext {
  readonly locationId: string | number;
  readonly tableId: string | number | null;
  readonly vatPercent: number;
  readonly serviceChargePercent: number;
  readonly allowedProviders: ReadonlyArray<string>;
}

/**
 * POST /api/orders/place
 *
 * Anonymous endpoint. Accepts a cart payload, resolves the branch +
 * table from the QR landing context, recomputes totals server-side (NEVER
 * trust the client's amount), creates an Order with kitchenStatus='placed'.
 *
 * Payment integration is staged: for dine-in we create the order as
 * 'pending payment' and return a tracker URL the caller will wire to the
 * Stripe flow in a follow-up chunk; for cash-on-pickup we create the order
 * with paymentStatus='pending' and the staff settles it at handover.
 */
export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const input = yield* parseBody(placeOrderSchema, req);
      const db = yield* Payload;

      const ctx = yield* resolveContext(db, input);

      // Server-side authority on payment provider allow-list.
      const provider = pickPaymentProvider({
        chosenProviderId: input.paymentProvider as
          | "stripe"
          | "cash-on-pickup"
          | "paymob"
          | "fawry",
        fulfillmentMode: input.fulfillmentMode as
          | "dine-in"
          | "pickup"
          | "delivery"
          | "merch",
        branchAllowedProviders: ctx.allowedProviders as Array<
          "stripe" | "cash-on-pickup" | "paymob" | "fawry"
        >,
      });
      if (!provider.ok) {
        return yield* Effect.fail(
          new PaymentProviderNotAllowedError({
            provider: input.paymentProvider,
            fulfillmentMode: input.fulfillmentMode,
          }),
        );
      }

      const totals = computeCartTotals({
        lineItems: input.lines.map((l) => ({ amount: l.amountQirsh })),
        fulfillmentMode: input.fulfillmentMode as
          | "dine-in"
          | "pickup"
          | "delivery"
          | "merch",
        vatPercent: ctx.vatPercent,
        serviceChargePercent: ctx.serviceChargePercent,
        tipAmount: input.tipAmount,
      });

      const placedAt = new Date().toISOString();
      const order = yield* db.create({
        collection: "orders",
        data: {
          fulfillmentMode: input.fulfillmentMode,
          kitchenStatus: "placed",
          fulfillmentStatus:
            input.fulfillmentMode === "merch" ? "pending" : "processing",
          paymentStatus: "pending",
          paymentMethod: provider.provider.id,
          restaurantId: "kk-main",
          location: ctx.locationId,
          table: ctx.tableId,
          pickupTime: input.pickupTime ?? null,
          guestSessionId: input.guestSessionId ?? null,
          vatPercent: ctx.vatPercent,
          serviceChargePercent: ctx.serviceChargePercent,
          tipAmount: totals.tipAmount,
          amount: totals.grandTotal,
          currency: "EGP",
          kitchenAuditTrail: [
            {
              from: null,
              to: "placed",
              at: placedAt,
              byUserId: "system",
              byUserName: "checkout",
            },
          ],
        },
      });

      const orderDoc = order as { id: string | number };

      // Create a Stripe PaymentIntent for upfront-settling providers.
      const decision = decidePaymentIntent({
        providerId: provider.provider.id,
        providerSettlesUpfront: provider.provider.settlesUpfront,
        amountQirsh: totals.grandTotal,
        orderId: orderDoc.id,
        fulfillmentMode: input.fulfillmentMode as
          | "dine-in"
          | "pickup"
          | "delivery"
          | "merch",
        locationId: ctx.locationId,
        tableId: ctx.tableId,
      });

      let clientSecret: string | null = null;
      let paymentIntentId: string | null = null;
      if (decision.shouldCreate) {
        const stripe = yield* StripeService;
        const intent = yield* stripe.createOrderPaymentIntent({
          amount: decision.amount,
          currency: decision.currency,
          metadata: decision.metadata,
          idempotencyKey: decision.idempotencyKey,
        });
        clientSecret = intent.clientSecret;
        paymentIntentId = intent.id;

        yield* db.update({
          collection: "orders",
          id: orderDoc.id,
          data: { paymentIntentId },
        });
      }

      const trackerUrl = `/orders/${orderDoc.id}/track`;
      const payUrl = clientSecret
        ? `/orders/${orderDoc.id}/pay`
        : null;

      return created({
        orderId: orderDoc.id,
        trackerUrl,
        payUrl,
        clientSecret,
        paymentIntentId,
        totals: {
          subtotal: totals.subtotal,
          vatAmount: totals.vatAmount,
          serviceChargeAmount: totals.serviceChargeAmount,
          tipAmount: totals.tipAmount,
          grandTotal: totals.grandTotal,
        },
        paymentProvider: provider.provider.id,
        settlesUpfront: provider.provider.settlesUpfront,
      });
    }).pipe(Effect.provide(AppLive)),
  );

function resolveContext(
  db: ReturnType<typeof Payload.of>,
  input: { tableShortId?: string | null; tableId?: string | number | null; locationId?: string | number | null; locationSlug?: string | null },
) {
  return Effect.gen(function* () {
    type TableDoc = {
      id: string | number;
      status?: string;
      location?: { id: string | number } | string | number;
    };
    type LocationDoc = {
      id: string | number;
      vatPercent?: number;
      serviceChargePercent?: number;
      allowedPaymentProviders?: ReadonlyArray<string>;
    };

    let tableDoc: TableDoc | null = null;

    if (input.tableShortId) {
      const r = yield* db.find({
        collection: "tables",
        where: { shortId: { equals: input.tableShortId } },
        limit: 1,
      });
      tableDoc = (r.docs as TableDoc[])[0] ?? null;
      if (!tableDoc) {
        return yield* Effect.fail(
          new NotFoundError({ resource: "table", id: input.tableShortId }),
        );
      }
    } else if (input.tableId) {
      const found = yield* db.findByID({
        collection: "tables",
        id: input.tableId,
      });
      tableDoc = found as TableDoc;
    }

    if (tableDoc) {
      if (tableDoc.status === "inactive") {
        return yield* Effect.fail(
          new TableInactiveError({
            tableId: tableDoc.id,
            shortId: input.tableShortId ?? undefined,
          }),
        );
      }
    }

    let locationId: string | number | null = null;
    if (tableDoc?.location) {
      locationId =
        typeof tableDoc.location === "object"
          ? tableDoc.location.id
          : tableDoc.location;
    } else if (input.locationId) {
      locationId = input.locationId;
    } else if (input.locationSlug) {
      const r = yield* db.find({
        collection: "locations",
        where: { slug: { equals: input.locationSlug } },
        limit: 1,
      });
      const loc = (r.docs as LocationDoc[])[0];
      if (!loc) {
        return yield* Effect.fail(
          new NotFoundError({
            resource: "location",
            id: input.locationSlug,
          }),
        );
      }
      locationId = loc.id;
    }

    if (locationId === null) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Order requires a branch",
          details: { input },
        }),
      );
    }

    const locationDoc = yield* db.findByID({
      collection: "locations",
      id: locationId,
    });
    const loc = locationDoc as LocationDoc;
    const ctx: ResolvedContext = {
      locationId,
      tableId: tableDoc?.id ?? null,
      vatPercent: typeof loc.vatPercent === "number" ? loc.vatPercent : 14,
      serviceChargePercent:
        typeof loc.serviceChargePercent === "number"
          ? loc.serviceChargePercent
          : 12,
      allowedProviders: loc.allowedPaymentProviders ?? [
        "stripe",
        "cash-on-pickup",
      ],
    };
    return ctx;
  });
}
