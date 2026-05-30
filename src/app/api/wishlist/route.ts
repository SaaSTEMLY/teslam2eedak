import { Effect } from "effect";

import {
  handleRoute,
  ok,
  created,
  Auth,
  Payload,
  AppLive,
  parseBody,
  ConflictError,
} from "@/lib/effect";
import { addToWishlistSchema } from "./schema";

const WISHLISTS = "wishlists" as const;

export const GET = () =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireUser;

      const db = yield* Payload;
      const payloadUser = yield* db.findUserByEmail(user.email).pipe(
        Effect.catchTag("NotFoundError", () =>
          Effect.succeed({
            id: null as string | number | null,
            email: user.email,
          }),
        ),
      );

      if (!payloadUser.id) {
        return ok({ items: [] });
      }

      const wishlist = yield* db.find({
        collection: WISHLISTS,
        where: { customer: { equals: payloadUser.id } },
        sort: "-addedAt",
        limit: 50,
        depth: 2,
      });

      return ok({ items: wishlist.docs });
    }).pipe(Effect.provide(AppLive)),
  );

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireUser;

      const { productId, variantId } = yield* parseBody(
        addToWishlistSchema,
        req,
      );

      const db = yield* Payload;
      const payloadUser = yield* db.findUserByEmail(user.email);

      // Check if already in wishlist
      const existing = yield* db.find({
        collection: WISHLISTS,
        where: {
          and: [
            { customer: { equals: payloadUser.id } },
            { product: { equals: Number(productId) } },
          ],
        },
        limit: 1,
      });

      if (existing.totalDocs > 0) {
        return yield* new ConflictError({ message: "Already in wishlist" });
      }

      const item = yield* db.create({
        collection: WISHLISTS,
        data: {
          customer: payloadUser.id,
          product: Number(productId),
          ...(variantId ? { variant: Number(variantId) } : {}),
          addedAt: new Date().toISOString(),
        },
      });

      return created({ item });
    }).pipe(Effect.provide(AppLive)),
  );
