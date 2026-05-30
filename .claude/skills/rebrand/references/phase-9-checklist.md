# Phase 9: Final Checklist

## Search for Remaining References

```bash
grep -ri "saastarter" src/ --include="*.ts" --include="*.tsx"
grep -ri "saastarter" public/ --include="*.css"
grep -ri "saastemly" src/
```

Fix any remaining brand references.

## Verification Checklist

- [ ] **Payload Admin** — `/admin`: brand name, favicon, logo correct
- [ ] **Landing Page** — All text reflects brand, no "SaaSTARTER" remnants
- [ ] **SEO** — Page source: correct `<title>`, OG tags, Twitter cards
- [ ] **PWA** — Install from browser: icons and app name correct
- [ ] **Emails** — Trigger test email (sign up, reset password): branding correct
- [ ] **Header/Footer** — Brand name, logo, social links, copyright updated
- [ ] **About Page** — Reflects your company story
- [ ] **Legal Pages** — Terms, Privacy, License: your brand and legal entity
- [ ] **Products** — Categories, descriptions, pricing match offerings
- [ ] **Checkout** — Complete test purchase, verify order confirmation email
- [ ] **Order Tracking** — Fulfillment status emails render with brand colors
- [ ] **Reviews** — Submit test review, verify moderation in admin
- [ ] **Wishlists** — Add/remove items, verify wishlist tab on account page
- [ ] **Newsletter** — Subscribe via footer form, verify subscriber in admin
- [ ] **Search** — Cmd+K search for products and blogs
- [ ] **Admin Dashboard** — Analytics loads (requires SaaSignal token)
- [ ] **Error Pages** — Visit non-existent URL: 404 page works
- [ ] **Blog** — Seed posts reflect your content
- [ ] **FAQs** — Questions relevant to your product
- [ ] **i18n** — Switch to each language: translations correct
- [ ] **RTL** — Arabic: layout direction correct
- [ ] **Dark Mode** — Toggle: all pages render correctly
- [ ] **Color Scheme** — Switch schemes: consistency maintained
- [ ] **Mobile** — Test at 320px viewport width minimum
- [ ] **Public API Docs** — `/api/docs`: brand name in title, only storefront endpoints visible, Scalar UI loads
- [ ] **Admin API Docs** — `/api/admin/docs`: all endpoints visible including admin/internal
- [ ] **OpenAPI Spec** — `/api/openapi.json`: `info.title`, `info.contact` correct, no admin/internal endpoints
- [ ] **LLMs** — `/llms.txt`: renders correctly with brand name, storefront endpoints only
- [ ] **Human Docs** — `/to-humans.md`: brand name and descriptions correct, storefront endpoints only

## Quality Checks

```bash
bun check         # TypeScript — zero errors, no `any`
bun lint          # ESLint — zero errors, zero warnings
bun format        # Prettier
bun run api:types # Regenerate API client types (if any schemas changed)
bun run test      # Integration tests — all 67 should pass
bun dev           # Verify everything runs
```

- [ ] **Integration Tests** — `bun run test`: all 67 tests pass (contact, newsletter, reviews, wishlist, cart, orders, products, blogs, FAQs, search, addresses, carts, discount, API docs, API keys, avatar, recommendations)

## Backend Architecture Checks

If any API routes or backend logic were added/modified during rebranding:

- [ ] **Services used** — No business logic duplicated in route handlers. Stripe calls go through `StripeService`, discount logic through `Discount`, cart auth through `CartService`.
- [ ] **New services wired** — Any new services added to `AppLive` in `src/lib/effect/layers.ts` and exported from `src/lib/effect/index.ts`.
- [ ] **Error handling** — New errors added to `HttpError` union and `errorToResponse()` switch in `route-handler.ts`. Use `/effect-errors` for guidance.
- [ ] **Type safety** — No `any`, no `as unknown as`, no `eslint-disable no-explicit-any`. `as` only at Payload/Stripe type boundaries. Use `/typescript-types-best-practices` for guidance.
- [ ] **Validation** — All POST/PUT/PATCH routes use `parseBody(zodSchema, req)` with a schema in their `schema.ts` file.
- [ ] **Rate limiting** — Rate-limited endpoints use `checkRateLimit()` from `@/lib/effect/rate-limit`.
- [ ] **Admin routes** — Admin-only endpoints use `auth.requireAdmin`, not inline role checks.
