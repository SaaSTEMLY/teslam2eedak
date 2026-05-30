import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  parseBody,
  ValidationError,
} from "@/lib/effect";
import { DeleteAccountRequestSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { token } = yield* parseBody(DeleteAccountRequestSchema, req);
      const db = yield* Payload;

      const identifier = `delete-account-${token}`;

      const verifications = yield* db.find({
        collection: "verifications" as "users",
        where: { identifier: { equals: identifier } },
        limit: 1,
      });

      const verification = verifications.docs[0] as unknown as
        | { id: number; value: string; expiresAt: string }
        | undefined;

      if (!verification) {
        return yield* new ValidationError({
          message: "Invalid or expired token",
          details: {},
        });
      }

      if (new Date(verification.expiresAt) < new Date()) {
        yield* db.del({
          collection: "verifications" as "users",
          id: verification.id,
        });
        return yield* new ValidationError({
          message: "Token has expired",
          details: {},
        });
      }

      const userId = Number(verification.value);

      const user = yield* db.findByID({ collection: "users", id: userId });

      const { betterAuthOptions } = yield* Effect.tryPromise(
        () => import("@/lib/auth/options"),
      ).pipe(Effect.orDie);
      const beforeDelete = betterAuthOptions.user.deleteUser.beforeDelete;
      if (beforeDelete) {
        yield* Effect.tryPromise(() =>
          beforeDelete(user as unknown as Parameters<typeof beforeDelete>[0]),
        ).pipe(Effect.orDie);
      }

      yield* db.del({ collection: "users", id: userId });

      yield* db.del({
        collection: "verifications" as "users",
        id: verification.id,
      });

      return ok({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
