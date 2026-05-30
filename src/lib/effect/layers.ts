import { Layer } from "effect";

import { AuthLive } from "./services/auth";
import { CartLive } from "./services/cart";
import { DiscountLive } from "./services/discount";
import { PayloadLive } from "./services/payload";
import { StripeLive } from "./services/stripe";

/**
 * Full application layer for route handlers.
 *
 * Composed from individual service layers. Layer construction is lazy —
 * services are only initialized when the Effect program accesses them.
 *
 * Dependency graph:
 *   PayloadLive (no deps)
 *   ├── AuthLive
 *   │   └── CartLive (depends on Auth + Payload)
 *   ├── DiscountLive
 *   └── StripeLive
 *
 * Usage:
 * ```ts
 * export const GET = (req: Request) =>
 *   handleRoute(
 *     Effect.gen(function* () {
 *       const auth = yield* Auth
 *       const user = yield* auth.requireUser
 *       // ...
 *       return ok({ data })
 *     }).pipe(Effect.provide(AppLive))
 *   )
 * ```
 */

const DiscountLayer = Layer.provideMerge(DiscountLive, PayloadLive);
const StripeLayer = Layer.provideMerge(StripeLive, PayloadLive);
const AuthLayer = Layer.provideMerge(AuthLive, PayloadLive);
const CartLayer = Layer.provideMerge(CartLive, AuthLayer);

export const AppLive = Layer.mergeAll(
  AuthLayer,
  PayloadLive,
  DiscountLayer,
  StripeLayer,
  CartLayer,
);
