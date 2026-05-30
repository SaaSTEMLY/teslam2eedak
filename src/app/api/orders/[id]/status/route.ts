import { Effect } from "effect";

import {
  AppLive,
  Auth,
  Payload,
  NotFoundError,
  ValidationError,
  handleRoute,
  ok,
  parseBody,
} from "@/lib/effect";
import {
  validateTransition,
} from "@/lib/ordering/status-transitions";
import {
  KITCHEN_STATUSES,
  type KitchenStatus,
} from "@/lib/ordering/tracker";

import { updateStatusSchema } from "./schema";

const KNOWN = new Set<string>(KITCHEN_STATUSES);

/**
 * PATCH /api/orders/:id/status
 *
 * Staff-only. Advances an order's kitchenStatus per the canonical
 * transition rules. Appends an entry to kitchenAuditTrail with the
 * acting user. Rejects 400 on invalid transitions; 404 if the order
 * is missing; 401/403 via the Auth service.
 */
export const PATCH = (
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireAdmin;

      const { id } = yield* Effect.tryPromise({
        try: () => ctx.params,
        catch: () =>
          new NotFoundError({ resource: "order", id: "missing-param" }),
      });
      const orderId = /^\d+$/.test(id) ? Number(id) : id;

      const { to } = yield* parseBody(updateStatusSchema, req);
      const toStatus = to as KitchenStatus;

      const db = yield* Payload;
      const current = yield* db.findByID({
        collection: "orders",
        id: orderId,
      });
      type OrderDoc = {
        id: string | number;
        kitchenStatus?: string;
        kitchenAuditTrail?: ReadonlyArray<{
          from?: string | null;
          to: string;
          at: string;
          byUserId?: string;
          byUserName?: string;
        }>;
      };
      const order = current as OrderDoc;
      const fromRaw = order.kitchenStatus ?? "placed";
      const fromStatus: KitchenStatus = KNOWN.has(fromRaw)
        ? (fromRaw as KitchenStatus)
        : "placed";

      const err = validateTransition(fromStatus, toStatus);
      if (err) {
        return yield* Effect.fail(
          new ValidationError({
            message:
              err.kind === "terminal"
                ? `Order is ${err.from} (terminal) and cannot transition`
                : err.kind === "same-state"
                  ? `Order is already ${err.status}`
                  : `Transition ${err.from} → ${err.to} is not allowed`,
            details: err,
          }),
        );
      }

      const at = new Date().toISOString();
      const userId = String(user.id ?? "unknown");
      const userName =
        (user as { name?: string }).name ?? user.email ?? userId;

      yield* db.update({
        collection: "orders",
        id: orderId,
        data: {
          kitchenStatus: toStatus,
          kitchenAuditTrail: [
            ...(order.kitchenAuditTrail ?? []),
            {
              from: fromStatus,
              to: toStatus,
              at,
              byUserId: userId,
              byUserName: userName,
            },
          ],
        },
      });

      return ok({
        orderId,
        from: fromStatus,
        to: toStatus,
        at,
      });
    }).pipe(Effect.provide(AppLive)),
  );
