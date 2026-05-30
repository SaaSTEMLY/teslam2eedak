/**
 * Legacy → consumer redirects.
 *
 * The starter shipped a SaaS-shaped surface (/products, /checkout,
 * /cart, /license). KK reshapes that surface around the QR ordering
 * flow — /menu is the catalogue, /orders/[id]/pay is checkout,
 * license has no café meaning.
 *
 * The map is exported so the same source-of-truth feeds Next.js's
 * runtime redirects AND a tests/unit assertion that the redirects
 * stay aligned with the consumer flow (i.e., we don't accidentally
 * delete a route without removing its inbound redirect).
 */

export interface LegacyRedirectRule {
  readonly source: string;
  readonly destination: string;
  readonly permanent: boolean;
}

export const LEGACY_REDIRECTS: ReadonlyArray<LegacyRedirectRule> = [
  // /products belonged to the SaaS template surface; menu items live in
  // /menu now (per ADR-0003 — Payload `products` collection is reused
  // server-side, but customer-facing UX is /menu).
  { source: "/products", destination: "/menu", permanent: true },
  { source: "/products/:slug*", destination: "/menu", permanent: true },

  // The SaaS Stripe checkout is unused for the QR flow (which uses
  // /orders/[id]/pay). Merch is deferred per GOAL §11; until it ships,
  // /checkout → /menu is the right honest redirect.
  { source: "/checkout", destination: "/menu", permanent: true },
  { source: "/checkout/:rest*", destination: "/menu", permanent: true },

  // SaaS cart page; QR-flow uses the cart-drawer inside /menu.
  { source: "/cart", destination: "/menu", permanent: true },

  // SaaS template license has no café meaning. Send curious visitors to
  // the closest restaurant-facing legal page.
  { source: "/license", destination: "/terms", permanent: true },

  // Wishlist UI is deferred (GOAL §11). Temporary redirect — once
  // loyalty ships, the destination may change, so keep it 307.
  { source: "/wishlist", destination: "/account", permanent: false },
];
