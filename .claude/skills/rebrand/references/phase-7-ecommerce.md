# Phase 7: Ecommerce Pages

## 7.1 Product Pages

**`src/messages/products/{en,ar,es}.ts`** — Update listing/detail text.
Products managed at `/admin/collections/products`. Categories configured in Phase 1.

## 7.2 Cart

**`src/messages/cart/{en,ar,es}.ts`** — Cart drawer/page text, empty state messages.

## 7.3 Checkout

**`src/messages/checkout/{en,ar,es}.ts`** — Checkout flow text, payment labels, order summary.

## 7.4 Stripe Configuration

**`.env`:**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

Stripe Dashboard setup:

1. Brand name and logo in Settings → Branding
2. Webhook endpoints for production domain
3. Products/prices matching seed data

## 7.5 Product Reviews

Collection: `src/collections/reviews.ts` — Ratings 1-5, title, body, status, verified purchase, helpful count. Generic, no brand changes.

| Component   | File                                          |
| ----------- | --------------------------------------------- |
| Reviews     | `src/components/products/product-reviews.tsx` |
| Review Form | `src/components/products/review-form.tsx`     |
| Summary     | `src/components/products/review-summary.tsx`  |
| Stars       | `src/components/products/star-rating.tsx`     |

API: `src/app/api/reviews/route.ts`, `src/app/api/reviews/[reviewId]/helpful/route.ts`
i18n: `src/messages/reviews/{en,ar,es}.ts`

## 7.6 Wishlists

Collection: `src/collections/wishlists.ts` — Generic.

| Component       | File                                          |
| --------------- | --------------------------------------------- |
| Wishlist Button | `src/components/products/wishlist-button.tsx` |
| Wishlist Card   | `src/components/account/wishlist-card.tsx`    |

API: `src/app/api/wishlist/route.ts`, `src/app/api/wishlist/[itemId]/route.ts`, `src/app/api/wishlist/check/[productId]/route.ts`
i18n: `src/messages/wishlist/{en,ar,es}.ts`

## 7.7 Product Filters & Cards

| Component       | File                                          |
| --------------- | --------------------------------------------- |
| Product Filters | `src/components/products/product-filters.tsx` |
| Product Card    | `src/components/products/product-card.tsx`    |
| Blog Filters    | `src/components/blogs/blog-filters.tsx`       |

Filter/sort keys in `products` and `blogs` i18n namespaces.

## 7.8 Product Recommendations

API: `src/app/api/recommendations/related/[productId]/route.ts`, `src/app/api/recommendations/signal/route.ts`

| Component        | File                                           |
| ---------------- | ---------------------------------------------- |
| Related Products | `src/components/products/related-products.tsx` |
| Signal Tracker   | `src/components/products/signal-tracker.tsx`   |

No brand-specific content — data-driven.

## 7.9 Order Fulfillment Tracking

`fulfillmentStatus`: pending/processing/shipped/delivered/cancelled.

**`src/lib/email/order-status.ts`** — Branded status update emails. Update colors/copy (same as Phase 4.7).
**`src/components/account/order-status-listener.tsx`** — Realtime via SaaSignal.
i18n: `account` and `email` namespaces.

## 7.10 Discount Codes

Admin at `/admin/collections/discount-codes`. No code changes — just create your own codes.

Discount validation and calculation logic lives in the `Discount` Effect service (`src/lib/effect/services/discount.ts`). If you need to add discount types (e.g., buy-one-get-one, tiered), extend the service — don't add logic to route handlers.

## 7.11 Add Card Dialog

**`src/messages/add-card-dialog/{en,ar,es}.ts`** — Payment card dialog text.

## 7.12 Backend Architecture (Services)

Ecommerce API routes delegate to Effect services for business logic. When modifying ecommerce behavior:

| Concern | Service | File |
|---------|---------|------|
| Payment methods, customers, intents | `StripeService` | `src/lib/effect/services/stripe.ts` |
| Discount validation & calculation | `Discount` | `src/lib/effect/services/discount.ts` |
| Cart ownership & authorization | `CartService` | `src/lib/effect/services/cart.ts` |
| Admin-only access | `Auth.requireAdmin` | `src/lib/effect/services/auth.ts` |
| Rate limiting | `checkRateLimit()` | `src/lib/effect/rate-limit.ts` |

**When adding new ecommerce features** (e.g., subscriptions, inventory alerts, shipping calculators):
1. Create a new service in `src/lib/effect/services/` following the existing pattern
2. Wire it into `AppLive` in `src/lib/effect/layers.ts`
3. Export from `src/lib/effect/index.ts`
4. Keep route handlers thin — parse input, call services, return response
5. Add a Zod schema in the route's `schema.ts`, validate with `parseBody()`
6. Add a matching integration test in `tests/routes/`

See `/effect-errors` and `/typescript-types-best-practices` for error handling and type patterns.
