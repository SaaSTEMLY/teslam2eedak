# Ship adapter interfaces for OrderSink and PaymentProvider with a single MVP implementation

Two abstractions ship in MVP with only one (or two) implementations each: an `OrderSink` interface (default: our Live Orders Board kanban) for receiving confirmed orders, and a `PaymentProvider` interface (day-1: Stripe + CashOnPickup) for charging carts. Normally we avoid abstraction without a second user, but both surfaces have well-known second users on the deferred roadmap — POS systems (Foodics, Marn, Square) for `OrderSink`, and Paymob/Fawry/Vodafone Cash for `PaymentProvider` — and the integration points (route handlers, the kanban, the Stripe webhook) are precisely the code that would be most painful to refactor later because they touch every order in the system. The cost is roughly half a day of design upfront in exchange for adapters being a drop-in addition rather than a cross-cutting refactor.

## Considered Options

- **No abstraction; refactor when first POS / second payment provider arrives** — rejected: the refactor would touch every route handler and the orders collection migration; risk of breaking live orders during the migration is the dominant cost.
- **Build a Foodics adapter alongside Stripe in MVP** — rejected: heavy investment in a specific integration without a confirmed first POS customer.

## Consequences

- Menu items must carry an optional `posItemId` per provider so POS adapters can map our items to their menus.
- `PaymentProvider` declares an `allowedFulfillmentModes` so the system can enforce constraints (e.g., CashOnPickup blocked for dine-in).
- The default `OrderSink` (kanban) and a future POS adapter can coexist on the same branch, or a POS-connected branch can disable the kanban — the choice is per-branch configuration.
- The interfaces are local contracts, not published APIs — we may change them freely until the first second implementation lands, at which point they freeze.
