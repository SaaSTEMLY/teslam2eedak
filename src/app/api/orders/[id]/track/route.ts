import { Effect } from "effect";

import {
  AppLive,
  Payload,
  NotFoundError,
  handleRoute,
  ok,
} from "@/lib/effect";
import {
  KITCHEN_STATUSES,
  type KitchenStatus,
} from "@/lib/ordering/tracker";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";

const VALID_STATUSES = new Set<string>(KITCHEN_STATUSES);

/**
 * GET /api/orders/:id/track
 *
 * Anonymous endpoint returning the customer-tracker shape for an order.
 * Returns 404 when the order doesn't exist. This is the only customer
 * surface for an order pre- and post-delivery, so it must be safely
 * polled — no expensive joins, no side effects.
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
      const doc = yield* db.findByID({
        collection: "orders",
        id: orderId,
      });

      type LineItem = {
        title?: string;
        quantity?: number;
        amount?: number;
      };
      type OrderDoc = {
        id: string | number;
        kitchenStatus?: string;
        fulfillmentMode?: string;
        currency?: string;
        amount?: number;
        createdAt?: string;
        items?: ReadonlyArray<LineItem>;
        location?: { id: string | number; name?: string } | string | number;
        table?: { id: string | number; label?: string } | string | number;
        pickupTime?: string | null;
        kitchenAuditTrail?: ReadonlyArray<{ to: string; at: string }>;
      };

      const order = doc as OrderDoc;
      const statusRaw = order.kitchenStatus ?? "placed";
      const status: KitchenStatus = VALID_STATUSES.has(statusRaw)
        ? (statusRaw as KitchenStatus)
        : "placed";

      const placedAt = pickPlacedAt(order);

      const locationLabel =
        typeof order.location === "object" && order.location
          ? order.location.name
          : undefined;
      const tableLabel =
        typeof order.table === "object" && order.table
          ? order.table.label
          : undefined;

      return ok({
        orderId: order.id,
        status,
        fulfillmentMode: (order.fulfillmentMode ?? "pickup") as FulfillmentMode,
        currency: order.currency ?? "EGP",
        amountQirsh: order.amount ?? 0,
        placedAt,
        items: (order.items ?? []).map((it) => ({
          title: it.title ?? "",
          quantity: it.quantity ?? 0,
          amount: it.amount ?? 0,
        })),
        location: locationLabel ? { label: locationLabel } : null,
        table: tableLabel ? { label: tableLabel } : null,
        pickupTime: order.pickupTime ?? null,
      });
    }).pipe(Effect.provide(AppLive)),
  );

function pickPlacedAt(order: {
  createdAt?: string;
  kitchenAuditTrail?: ReadonlyArray<{ to: string; at: string }>;
}): string {
  const placed = (order.kitchenAuditTrail ?? []).find(
    (e) => e.to === "placed",
  );
  return placed?.at ?? order.createdAt ?? new Date(0).toISOString();
}
