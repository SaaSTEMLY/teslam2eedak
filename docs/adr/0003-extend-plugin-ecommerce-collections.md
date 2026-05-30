# Reuse `@payloadcms/plugin-ecommerce` collections for menu, cart, and orders

Menu items are modeled as extended `products`, carts as extended `carts`, and restaurant orders as extended `orders` from `@payloadcms/plugin-ecommerce` — using the plugin's existing `productsCollectionOverride`, `cartsCollectionOverride`, and `ordersCollectionOverride` hooks rather than introducing parallel `menuItems` and `tickets` collections. This lets the restaurant flows inherit Stripe payment intents, discount codes, checkout success handling, and the future merch flow for free, and keeps us on the plugin's upgrade path. The cost is a domain-vs-substrate tension — SaaS-shaped fields like `priceInUSD` and ship-to-address fulfillment live in collections we're using for café orders — which we accept as a deliberate trade for the code-share with merch and the reduced surface area to maintain.

## Considered Options

- **Fork: separate `menuItems` + `tickets` collections, reuse `carts`** — rejected: re-implements Stripe wiring, discount validation, and checkout flow; loses merch code-share.
- **Hybrid: `products` for everything, parallel `tickets` collection** — kept as a future option if drinks/food ticket-splitting becomes real; for now, ticket = order 1:1.

## Consequences

- The `Ticket` concept exists as a denormalized projection over `orders`, not its own collection — so a future split (drinks at bar, food in kitchen) won't break customer flows.
- `fulfillmentMode` (`dine-in | pickup | delivery | merch`) is a first-class field on Cart and Order from day 1, even though MVP only ships the first two.
- Order line items snapshot VAT and service-charge percentages at creation time; historical orders are immutable to admin rate changes.
- We must keep `productsCollectionOverride` etc. forward-compatible with future plugin releases; breaking changes from the plugin are a real upgrade risk worth tracking.
