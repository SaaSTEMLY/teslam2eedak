import { Effect } from "effect";

import { AppLive, Auth, Payload, handleRoute, ok } from "@/lib/effect";
import {
  KITCHEN_STATUSES,
  type KitchenStatus,
} from "@/lib/ordering/tracker";

const KNOWN = new Set<string>(KITCHEN_STATUSES);

/**
 * GET /api/staff/orders?location=<id>
 *
 * Returns active orders (non-delivered, non-cancelled) for the Live
 * Orders Board kanban. Delivered orders auto-archive after N hours via
 * a separate cleanup job (not yet implemented — see GOAL §7).
 */
export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      yield* auth.requireAdmin;

      const url = new URL(req.url);
      const locationParam = url.searchParams.get("location");
      const since = url.searchParams.get("since"); // optional ISO date

      const db = yield* Payload;

      const where: Record<string, unknown> = {
        kitchenStatus: {
          not_in: ["delivered", "cancelled"],
        },
      };
      if (locationParam) {
        where.location = {
          equals: /^\d+$/.test(locationParam)
            ? Number(locationParam)
            : locationParam,
        };
      }
      if (since) {
        where.updatedAt = { greater_than: since };
      }

      const { docs, totalDocs } = yield* db.find({
        collection: "orders",
        where,
        limit: 100,
        sort: "createdAt",
      });

      type LineItem = {
        title?: string;
        quantity?: number;
      };
      type OrderDoc = {
        id: string | number;
        kitchenStatus?: string;
        fulfillmentMode?: string;
        createdAt?: string;
        updatedAt?: string;
        amount?: number;
        items?: ReadonlyArray<LineItem>;
        table?: { id: string | number; label?: string } | string | number;
        pickupTime?: string | null;
        paymentStatus?: string;
        paymentMethod?: string;
      };

      const tickets = (docs as OrderDoc[]).map((d) => ({
        orderId: d.id,
        kitchenStatus: (KNOWN.has(d.kitchenStatus ?? "")
          ? d.kitchenStatus
          : "placed") as KitchenStatus,
        fulfillmentMode: d.fulfillmentMode ?? "pickup",
        createdAt: d.createdAt ?? "",
        updatedAt: d.updatedAt ?? d.createdAt ?? "",
        amountQirsh: d.amount ?? 0,
        tableLabel:
          typeof d.table === "object" && d.table ? d.table.label : null,
        pickupTime: d.pickupTime ?? null,
        paymentStatus: d.paymentStatus ?? "pending",
        paymentMethod: d.paymentMethod ?? "stripe",
        items: (d.items ?? []).map((it) => ({
          title: it.title ?? "",
          quantity: it.quantity ?? 0,
        })),
      }));

      return ok({ totalDocs, tickets });
    }).pipe(Effect.provide(AppLive)),
  );
