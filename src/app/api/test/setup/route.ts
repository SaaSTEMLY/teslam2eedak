import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  ForbiddenError,
  ValidationError,
  NotFoundError,
} from "@/lib/effect";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      if (process.env.NODE_ENV === "production") {
        return yield* new ForbiddenError({
          message: "Not available in production",
        });
      }

      const body = yield* Effect.tryPromise({
        try: () => req.json() as Promise<Record<string, unknown>>,
        catch: () =>
          new ValidationError({ message: "Invalid JSON body", details: {} }),
      });

      const { action } = body;
      const db = yield* Payload;
      const raw = yield* db.raw;

      switch (action) {
        case "verify-email": {
          const { email } = body as { email?: string };
          if (!email) {
            return yield* new ValidationError({
              message: "email required",
              details: {},
            });
          }

          const users = yield* db.find({
            collection: "users",
            where: { email: { equals: email } },
            limit: 1,
          });
          const user = users.docs[0] as { id: string | number } | undefined;
          if (!user) {
            return yield* new NotFoundError({
              resource: "User",
              id: email,
            });
          }

          yield* db.update({
            collection: "users",
            id: user.id,
            data: { emailVerified: true } as Record<string, unknown>,
          });

          return ok({
            success: true,
            userId: String(user.id),
          });
        }

        case "create-discount": {
          const {
            code,
            discountType,
            discountValue,
            isActive,
            validFrom,
            validUntil,
          } = body as Record<string, unknown>;
          const doc = yield* db.create({
            collection: "discount-codes",
            data: {
              code,
              discountType,
              discountValue,
              isActive,
              validFrom,
              validUntil,
            },
          });
          const created = doc as { id: string | number };
          return ok({ success: true, id: String(created.id) });
        }

        case "cleanup": {
          const { collection, field, value } = body as Record<string, unknown>;
          if (!collection || !field || !value) {
            return yield* new ValidationError({
              message: "collection, field, value required",
              details: {},
            });
          }
          yield* Effect.tryPromise(() =>
            raw.delete({
              collection,
              where: { [field as string]: { equals: value } },
            } as never),
          ).pipe(Effect.orDie);
          return ok({ success: true });
        }

        case "cleanup-id": {
          const { collection, id } = body as Record<string, unknown>;
          if (!collection || !id) {
            return yield* new ValidationError({
              message: "collection, id required",
              details: {},
            });
          }
          yield* Effect.tryPromise(() =>
            raw.delete({ collection, id: Number(id) } as never),
          ).pipe(Effect.orDie);
          return ok({ success: true });
        }

        case "create-cart": {
          const { customer, items } = body as Record<string, unknown>;
          const doc = yield* Effect.tryPromise(() =>
            raw.create({
              collection: "carts",
              data: {
                customer: Number(customer),
                items: (items as unknown[]) || [],
              },
            } as never),
          ).pipe(Effect.orDie);
          const cart = doc as { id: string | number };
          return ok({ success: true, id: String(cart.id) });
        }

        default:
          return yield* new ValidationError({
            message: `Unknown action: ${action}`,
            details: { action },
          });
      }
    }).pipe(Effect.provide(AppLive)),
  );
