import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Auth,
  Payload,
  AppLive,
  ForbiddenError,
} from "@/lib/effect";

const WISHLISTS = "wishlists" as const;

export const DELETE = (
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireUser;
      const db = yield* Payload;

      const payloadUser = yield* db.findUserByEmail(user.email);
      const { itemId } = yield* Effect.promise(() => params);

      const item = yield* db.findByID({
        collection: WISHLISTS,
        id: Number(itemId),
        depth: 0,
      });

      const typedItem = item as unknown as {
        customer: number | { id: number };
      };
      const customerId =
        typeof typedItem.customer === "number"
          ? typedItem.customer
          : typedItem.customer?.id;

      if (customerId !== payloadUser.id) {
        return yield* new ForbiddenError({ message: "Not authorized" });
      }

      yield* db.del({
        collection: WISHLISTS,
        id: Number(itemId),
      });

      return ok({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
