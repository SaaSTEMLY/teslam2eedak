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
  PAYMENT_STATUSES,
  validatePaymentTransition,
  type PaymentStatus,
} from "@/lib/ordering/payment-status";

import { updatePaymentStatusSchema } from "./schema";

const KNOWN = new Set<string>(PAYMENT_STATUSES);

/**
 * PATCH /api/orders/:id/payment-status
 *
 * Staff-only. Updates an order's payment status with the canonical
 * transition rules. Used primarily by the Live Orders Board to mark
 * cash-on-pickup orders settled at handover; also accepts manual
 * refund transitions.
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

      const { to, reason } = yield* parseBody(updatePaymentStatusSchema, req);
      const toStatus = to as PaymentStatus;

      const db = yield* Payload;
      const current = yield* db.findByID({
        collection: "orders",
        id: orderId,
      });
      type OrderDoc = {
        id: string | number;
        paymentStatus?: string;
        kitchenAuditTrail?: ReadonlyArray<{
          from?: string | null;
          to: string;
          at: string;
          byUserId?: string;
          byUserName?: string;
        }>;
      };
      const order = current as OrderDoc;
      const fromRaw = order.paymentStatus ?? "pending";
      const fromStatus: PaymentStatus = KNOWN.has(fromRaw)
        ? (fromRaw as PaymentStatus)
        : "pending";

      const err = validatePaymentTransition(fromStatus, toStatus);
      if (err) {
        return yield* Effect.fail(
          new ValidationError({
            message:
              err.kind === "terminal"
                ? `Payment is ${err.from} (terminal)`
                : err.kind === "same-state"
                  ? `Payment is already ${err.status}`
                  : `Payment transition ${err.from} → ${err.to} is not allowed`,
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
          paymentStatus: toStatus,
          // Re-use the kitchen audit trail for payment events too so we
          // have one chronological tape for ops debugging. Prefix the
          // status so the kanban filter can ignore these entries cleanly.
          kitchenAuditTrail: [
            ...(order.kitchenAuditTrail ?? []),
            {
              from: `payment:${fromStatus}`,
              to: `payment:${toStatus}${reason ? ` (${reason})` : ""}`,
              at,
              byUserId: userId,
              byUserName: userName,
            },
          ],
        },
      });

      return ok({
        orderId,
        paymentStatus: toStatus,
        previous: fromStatus,
        at,
      });
    }).pipe(Effect.provide(AppLive)),
  );
