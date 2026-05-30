import { Context, Effect, Either, Layer } from "effect";

import {
  ForbiddenError,
  NotFoundError,
  PayloadOperationError,
  UnauthorizedError,
} from "../errors";
import { Auth } from "./auth";
import { Payload } from "./payload";

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuthorizedCart {
  id: number;
  status?: string;
  subtotal?: number;
  secret?: string;
  customer?: { id: string | number } | string | number | null;
  discountCode?: string | null;
}

// ── Service definition ──────────────────────────────────────────────────────

export interface CartServiceInterface {
  /**
   * Fetch a cart and verify the caller has access.
   * Access is granted if the caller is the cart owner (session user) or holds
   * the cart secret. Fails with NotFoundError if cart doesn't exist or is
   * purchased. Fails with ForbiddenError if neither owner nor valid secret.
   */
  readonly getAuthorizedCart: (opts: {
    cartId: number | string;
    secret?: string | null;
  }) => Effect.Effect<
    AuthorizedCart,
    NotFoundError | ForbiddenError | PayloadOperationError | UnauthorizedError
  >;
}

export class CartService extends Context.Tag("Cart")<
  CartService,
  CartServiceInterface
>() {}

// ── Live implementation ─────────────────────────────────────────────────────

export const CartLive = Layer.effect(
  CartService,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const db = yield* Payload;

    return CartService.of({
      getAuthorizedCart: ({ cartId, secret }) =>
        Effect.gen(function* () {
          const cart = (yield* db.findByID({
            collection: "carts",
            id: cartId,
            depth: 0,
          })) as AuthorizedCart;

          if (cart.status === "purchased") {
            return yield* new NotFoundError({
              resource: "Cart",
              id: String(cartId),
            });
          }

          // Try to get session user (optional — guests with secrets are allowed)
          const sessionResult = yield* Effect.either(auth.requireUser);
          const sessionUser = Either.isRight(sessionResult)
            ? sessionResult.right
            : null;

          const cartCustomerId =
            typeof cart.customer === "object" && cart.customer !== null
              ? cart.customer.id
              : cart.customer;

          const cartCustomerIdValue =
            cartCustomerId == null ? null : String(cartCustomerId);
          const sessionUserId = sessionUser?.id ? String(sessionUser.id) : null;
          const isOwner =
            !!sessionUserId &&
            !!cartCustomerIdValue &&
            cartCustomerIdValue === sessionUserId;
          const isSecretValid =
            !!secret && !!cart.secret && cart.secret === secret;

          if (!isOwner && !isSecretValid) {
            return yield* new ForbiddenError({ message: "Not authorized" });
          }

          return cart;
        }),
    });
  }),
);
