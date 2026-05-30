import { Effect } from "effect";

import { handleRoute, ok, Payload, AppLive, parseBody } from "@/lib/effect";
import { CartService } from "@/lib/effect/services/cart";

import { RemoveDiscountRequestSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const db = yield* Payload;
      const cart = yield* CartService;

      const { cartId, secret } = yield* parseBody(
        RemoveDiscountRequestSchema,
        req,
      );

      const authorizedCart = yield* cart.getAuthorizedCart({ cartId, secret });

      // Remove the discount code from the cart
      yield* db.update({
        collection: "carts",
        id: authorizedCart.id,
        data: { discountCode: null } as Record<string, unknown>,
      });

      return ok({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
