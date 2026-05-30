import { Effect } from "effect";

import { handleRoute, ok, Auth, Payload, AppLive } from "@/lib/effect";

const WISHLISTS = "wishlists" as const;

export const GET = (
  _req: Request,
  { params }: { params: Promise<{ productId: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const db = yield* Payload;

      const userResult = yield* Effect.either(auth.requireUser);
      if (userResult._tag === "Left") {
        return ok({ inWishlist: false });
      }
      const sessionUser = userResult.right;

      const payloadUserResult = yield* Effect.either(
        db.findUserByEmail(sessionUser.email),
      );
      if (payloadUserResult._tag === "Left") {
        return ok({ inWishlist: false });
      }
      const payloadUser = payloadUserResult.right;

      const { productId } = yield* Effect.promise(() => params);

      const existing = yield* db.find({
        collection: WISHLISTS,
        where: {
          and: [
            { customer: { equals: payloadUser.id } },
            { product: { equals: Number(productId) } },
          ],
        },
        limit: 1,
        depth: 0,
      });

      return ok({
        inWishlist: existing.totalDocs > 0,
        itemId: existing.docs[0]
          ? (existing.docs[0] as { id: number }).id
          : null,
      });
    }).pipe(Effect.provide(AppLive)),
  );
