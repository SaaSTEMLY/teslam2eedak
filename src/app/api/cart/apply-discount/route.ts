import { Effect } from "effect";

import { handleRoute, ok, Payload, AppLive, parseBody } from "@/lib/effect";
import { CartService } from "@/lib/effect/services/cart";
import { Discount } from "@/lib/effect/services/discount";

import { ApplyDiscountRequestSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const db = yield* Payload;
      const cart = yield* CartService;
      const discountService = yield* Discount;

      const { code, cartId, secret } = yield* parseBody(
        ApplyDiscountRequestSchema,
        req,
      );

      const authorizedCart = yield* cart.getAuthorizedCart({ cartId, secret });

      // Validate the discount code directly via the service
      const subtotal = authorizedCart.subtotal ?? 0;
      const result = yield* discountService.validate({
        code,
        subtotal,
      });

      // Persist the discount code on the cart
      yield* db.update({
        collection: "carts",
        id: authorizedCart.id,
        data: { discountCode: result.code } as Record<string, unknown>,
      });

      return ok({
        success: true,
        discount: {
          discountId: result.discountId,
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          maxDiscountAmount: result.maxDiscountAmount,
          discountAmount: result.discountAmount,
        },
      });
    }).pipe(Effect.provide(AppLive)),
  );
