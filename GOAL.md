# GOAL.md — teslam2eedak

> **One-liner.** A restaurant template repository that turns any printed café/restaurant menu into a QR-scan ordering experience — dine-in (table-paired) and click-and-collect (pickup) at launch, with delivery, merch, POS sync, recommendations, and AI assistants on the deferred roadmap.
>
> **First instance.** [Koffee Kulture](https://koffee-kulture.com/) — a multi-branch Cairo café. The template MUST be generic enough that any other café/restaurant can fork it; the KK rebrand is the reference implementation, not the only shape.
>
> **Substrate.** SaaSTEMLY / saastarter-next16: Next.js 16, PayloadCMS 3.75+ with `@payloadcms/plugin-ecommerce`, Better-Auth, Effect TS, Tailwind 4, Bun. See [CLAUDE.md](./CLAUDE.md) for engineering conventions and [CONTEXT.md](./CONTEXT.md) for the glossary of domain terms.

---

## 1. Tenancy model

teslam2eedak is a **fork-and-rebrand template** in the short term, with **schema future-proofed for multi-tenancy** later.

- Each **restaurant** = one fork + one deployment + one Payload database.
- Every restaurant-scoped collection (menu items, tables, orders, …) carries a `restaurantId` column from day 1. In single-tenant deployments it's a constant; switching to multi-tenant in the future is a routing / auth change, not a schema migration.
- Within one restaurant deployment, there are **many branches (locations)** — each with its own tables, opening hours, staff board, and per-item availability/price overrides. Menu authoring is restaurant-level by default; branches override.

## 2. Personas

| Persona | Surface | Need |
|---|---|---|
| **Guest** | Phone browser, no install, scans a QR | Order food/drinks fast, see price+tax breakdown, pay, know when it's ready |
| **Floor staff** ("waiter") | Tablet at floor station | See incoming orders, mark ready/delivered |
| **Kitchen staff** | Shared kitchen screen | See orders to prepare, mark when ready |
| **Restaurant manager** | Payload admin desktop | Author menu, draw hotspots, manage tables + branches, print QR codes, mark items 86, see day's revenue |
| **Restaurant owner** | Payload admin desktop | Same as manager + branding/payment/integration config |

> MVP collapses floor + kitchen staff into ONE role looking at ONE Live Orders Board. Role split is a deferred concern.

## 3. MVP scope (in / out)

### In MVP

- Dine-in ordering via per-table QR (pay-per-order)
- Click-and-collect ordering via generic pickup QR (ASAP or scheduled)
- Image-first menu rendering with admin-drawn hotspots, plus a structured list fallback
- Item customization: sizes, modifier groups, allergen icons, allergen filter, nutritional info, free-text notes, combo builder
- Per-item availability toggles (binary, with optional auto-restock at end of day)
- Live Orders Board: 4-state kanban (PLACED → PREPARING → READY → DELIVERED)
- VAT auto-added; service charge auto-added for dine-in only
- Optional tip slider, separate from service charge
- Multi-branch from one deployment (tables and live-orders scoped per branch)
- QR PDF generator: per-table tents, A4 sheet of stickers, generic pickup QR — branded
- On-screen order tracker (bookmark-able URL, live status); optional email receipt
- Locales: `en` and `ar` (RTL); drop `es` for KK
- Payments: Stripe (cards) + cash-on-pickup for click-and-collect
- Schema future-proofed for: multi-tenancy, multi-branch, delivery, merch, POS sync, payments other than Stripe

### Out of MVP (deferred, see §11)

- Delivery
- Merchandise (T-shirts, mugs, coffee bags)
- POS integration (Foodics, Marn, Square)
- Recommendations: "regulars", "suggestions on item view", "frequently bought together"
- AI features: order-building assistant, smart customization, upsell whisperer
- Loyalty / repeat-customer rewards
- Reservations
- SMS / WhatsApp notifications
- Open-tab dine-in (pay-at-end)
- Split bill
- Real-time per-table occupancy
- Web push notifications
- Stock count tracking (inventory)
- Thermal printer integration in kitchen
- Separate Kitchen Display + Waiter App (MVP uses one shared board)
- Self-serve restaurant signup (multi-tenant control plane)
- Online merch shipping fulfillment

---

## 4. Domain entities (high level)

These are concepts, not table definitions. See [CONTEXT.md](./CONTEXT.md) for one-line definitions; implementation lives in `src/collections/`.

- **Restaurant** — one brand, one deployment. (Single-tenant MVP; `restaurantId` reserved.)
- **Branch / Location** — a physical restaurant location. Has tables, hours, staff, and can override menu items.
- **Menu** — a per-branch (or restaurant-default) collection of menu sections, each containing menu items.
- **Menu Item** — an orderable item. Modeled as an extended `product` from `@payloadcms/plugin-ecommerce`. Has: name (per-locale), description, base price, sizes, modifier groups, allergens, nutritional info, image, availability flag.
- **Modifier Group** — a reusable named choice list (e.g., "Milk choice", "Extras"). Min/max selectable per group. Each option has a price delta.
- **Hotspot** — a normalized (0–1 coordinates) bounding box drawn on a menu image, linked to a menu item. Authoring tool lives in admin.
- **Menu Image** — uploaded per locale + per section. Renders as the primary customer surface with hotspots overlaid.
- **Table** — a physical table at a branch. Has a short-ID encoded in a QR code. Soft-deletable.
- **QR Artifact** — generated printable PDF for a table or for generic pickup. Includes brand styling.
- **Cart** — extended `cart` from plugin-ecommerce. Carries a `fulfillmentMode` (`dine-in`, `pickup`, `delivery`, `merch`) and a `tableId` (when dine-in) or `pickupTime` (when pickup).
- **Order** — extended `order` from plugin-ecommerce. Carries `fulfillmentMode`, `branchId`, `tableId` (when dine-in), `pickupTime` (when pickup), `status` enum (placed/preparing/ready/delivered/cancelled), VAT and service-charge rates captured at-order-time.
- **Ticket** — the staff-facing projection of an order shown on the Live Orders Board. In MVP, ticket and order are 1:1; the abstraction exists so a future split (drinks at the bar / food at the kitchen) doesn't break the customer-facing flow.
- **Order Sink** — interface that receives a confirmed order. Default = our own kitchen kanban. Future adapters: POS systems.
- **Payment Provider** — interface for `createIntent / capture / refund / handleWebhook`. Day-1 implementations: Stripe, CashOnPickup. Future: Paymob, Fawry, Vodafone Cash, Instapay.

---

## 5. Customer journey: Dine-in

1. **Scan** the QR on Table 7 → opens `/menu?t=<short-id>` in the phone browser. No login required.
2. Cart is anonymous, paired to `(branchId, tableId, sessionId)`. Two phones at the same table = two independent carts (no shared-cart model in MVP).
3. **Browse** the menu. Default view = menu image with hotspots overlaid; tapping a hotspot opens the item sheet. Toggle in the header switches to a structured list (always available; default for assistive-tech).
4. **Item sheet**: image (placeholder if none), description, price, size picker (if applicable), modifier groups (with min/max enforcement), allergen icons, nutritional info, quantity, free-text note ("no onions"). Combo builder appears for items in a combo group.
5. **Allergen filter** lives in the header (vegan, vegetarian, gluten-free, …). Active filter dims+badges non-matching hotspots in the image view; non-matching items are visually marked in the list. The filter never *hides* an item — it disables add-to-cart with an explanatory toast.
6. **Cart view**: line items with their modifiers, subtotal, VAT (14%, configurable), service charge (12%, dine-in only, configurable), optional tip slider, grand total.
7. **Pay**: Stripe Payment Intent (cards). The restaurant may configure additional providers; cash-on-pickup is NOT available for dine-in. Discount codes (existing collection) work as-is.
8. On success → **order tracker page**. Shows order #, items, current status (PLACED → PREPARING → READY → DELIVERED), table number, and an optional "email me the receipt" capture.
9. The order appears immediately on the staff Live Orders Board for that branch. Staff advance status. The tracker page reflects updates live.
10. **Receipt**: emailed if opted in; the tracker page is permanently bookmark-able and renders the receipt + status forever.

## 6. Customer journey: Click-and-collect

Reuses ≥90% of the dine-in flow:

1. Scan a generic pickup QR sticker (front door, flyer, Instagram). Or visit `/menu?mode=pickup` directly.
2. Cart is paired to `(branchId, mode=pickup, sessionId)`. No table.
3. Menu, customization, allergen filter — identical to dine-in.
4. Cart view: VAT (14%), NO service charge by default, optional tip, grand total.
5. **When?** picker: default is "ASAP" (system computes `prepTime` from the longest-prep item × queue depth). User can switch to "Schedule for later" → time-slot picker (configurable per branch).
6. Pay: Stripe **or** cash-on-pickup (configurable per branch). Cash-on-pickup orders still create an Order, mark `paymentStatus: pending`, and require a staff action at pickup to mark `paymentStatus: paid`.
7. On success → tracker page showing pickup #, ETA, current status. Optional email receipt.
8. Same Live Orders Board entry. Difference: the ticket header says "PICKUP — KK-0427" instead of "Table 7".

> Code reuse target: dine-in and pickup share the same cart, item sheet, payment, tracker, and Live Orders Board surfaces. The only differences are (a) the QR landing parameter, (b) the "when" step, and (c) the service-charge default.

## 7. Staff journey: Live Orders Board

- One screen per branch at `/staff` (or in Payload admin), accessible to staff role.
- Auto-refreshing kanban with four columns:
  - **PLACED** — paid, not yet started.
  - **PREPARING** — kitchen in progress.
  - **READY** — set on the bar / pass for pickup or delivery to table.
  - **DELIVERED** — handed to guest. Auto-archives after N hours.
- Each card shows: order #, table # or "PICKUP", items with modifiers, special notes, time-since-placed.
- Any staff member can tap to advance state. No role split in MVP. Soft-delete (cancel + refund) is allowed from any state pre-DELIVERED.
- The board is a denormalized view over the `orders` collection (the "Ticket" projection — see §4).

## 8. Admin journey: menu authoring + tables + branding

### Menu authoring

1. Admin uploads a **menu image** for a section (e.g., "Drinks", "Breakfast") per locale.
2. Hotspot tool opens: draw rectangles on the image, each linked to a menu item. Coordinates stored normalized (0–1).
3. Menu item editor: name (multi-locale), description, base price, sizes, modifier groups, allergens (multi-select), nutritional info, image (placeholder OK), availability flag.
4. Modifier Groups managed separately and reused across items. Each group has options with name + price delta + max-selectable. Groups reused across items.
5. Combo builder: define a combo group with eligible items and a fixed discount or fixed combo price.

### Tables and QR

1. `tables` collection per branch. Each table: label ("Table 7", "Window 3"), capacity (optional), status (active/inactive), short-ID (auto-generated, rotatable).
2. Per-restaurant settings for QR design: logo, primary color, footer text ("Scan to order").
3. Print actions: (a) **per-table tent PDF** (A6 with cut marks), (b) **A4 sheet** of N QRs in a grid, (c) **generic pickup QR PDF**. All exported as PDFs.
4. Deactivating a table: existing QR still resolves but the menu page shows "this table is no longer in service — order for pickup instead" with a CTA into the pickup flow.

### Branches

1. `locations` collection: name, address, phone, hours, status. Soft-delete.
2. Per-branch overrides on menu items: availability, price, prep-time. Default: inherit from restaurant.
3. Per-branch settings: vatPercent, serviceChargePercent, paymentProviders allowed.

## 9. Cross-cutting requirements

| Concern | Requirement |
|---|---|
| **Locales** | `en` (default) + `ar` (RTL). All customer-facing strings translatable; menu image is uploaded per locale. Item-name, description, modifier-group labels are per-locale. RTL applied throughout — Tailwind logical properties only (per [CLAUDE.md](./CLAUDE.md)). |
| **Accessibility** | The structured-list fallback is the accessibility surface: ARIA-labeled, keyboard-navigable, screen-reader-friendly. Image-overlay view is decorative; hotspots have accessible names. |
| **Mobile-first** | 320px minimum viewport. Phone is the primary surface. Admin is desktop-first. |
| **VAT + service charge** | Restaurant + branch override the rates. Cart shows the breakdown pre-pay. Order line items capture the rates AT ORDER TIME (so historical orders aren't broken when admin changes percentages). |
| **Payments** | Stripe + CashOnPickup ship in MVP via the `PaymentProvider` adapter. Adapter accepts a unique fulfillment-mode allow-list (dine-in MUST pre-pay; cash-on-pickup is pickup-only). |
| **Availability** | Per-item binary toggle + optional `unavailableUntil`. Dimmed-with-badge in both menu views. Add-to-cart blocked with a toast on tap. |
| **Authentication** | Better-Auth for staff + admin. Guests are anonymous — no Better-Auth session needed for ordering. Optional "save to account" hook at receipt step (deferred). |
| **Error handling** | Effect TS pattern from CLAUDE.md applies to all order/payment/menu API routes. New `TaggedError` types: `ItemUnavailableError`, `ModifierConstraintViolationError`, `BranchClosedError`, `TableInactiveError`, `PaymentProviderNotAllowedError`. |
| **Logging / observability** | Per-order audit trail: every state transition (and who triggered it) is recorded on the order. |
| **Existing collections** | Re-used as-is: `blogs`, `faqs`, `media`, `reviews`, `discount-codes`, `contact-form-submissions`, `newsletter-subscribers`, `wishlists`. Reviews collection becomes "restaurant reviews"; wishlists become "favorites" for future loyalty. |

## 10. Branding: Koffee Kulture as first instance

- Colors, typography, logo from [koffee-kulture.com](https://koffee-kulture.com/).
- Brand "voice": "Kulture" with a K is the in-joke — preserve in copy ("Klassiks", "Kreator", "Kulture"). Menu uses the K-naming convention throughout (Hot Klassiks, Kold Klassiks, Blended Koffee, etc.) — copy must reflect this.
- Menu images for `en` come from `public/menu1.jpg`, `public/menu2.jpg`, `public/menu3.jpg`. Hotspots drawn over them by admin (no automatic OCR-to-hotspot — author manually for MVP).
- Currency: `EGP` (LE). All prices on the KK menu are in LE.
- Initial seed data: drinks section (Hot Klassiks, Kold Klassiks, Blended Koffee, Mojitos Kulture, Smoothies, Refreshers, Ice Teas, Non Koffee, KK Extras), breakfast section (Benedict Kulture, Omelette Kulture, Scrambled Kulture, Sesame Bagel Kult, Tortilla Kulture, Bakery Kulture), all-day section (Bagels Kulture, Sandwich Kulture, Salads, Sweet Tooth Kulture).
- KK is **multi-branch in reality**; MVP seeds one branch ("Maadi") and the schema supports adding more.
- KK service charge is 12%, VAT is 14% — these become the configured defaults for KK; the template defaults to 0/0.
- Service hours for KK seed: extracted from their site; manager can override.

The `rebrand` skill from CLAUDE.md applies — the KK instance is the first run through that skill.

## 11. Deferred features (designed-for, not yet built)

Each item below has an architectural anchor in MVP so it can be added without painful migration.

### Delivery
- Anchor: `fulfillmentMode: 'delivery'` already accepted on `Cart` / `Order`. Address fields added to delivery-only checkout. Delivery zone + fee rules on the branch.
- Reuses: cart, item sheet, payment, tracker, Live Orders Board (the "READY" column gets a "rider assigned" sub-state).

### Merchandise
- Anchor: merch is just `products` with `fulfillmentMode: 'merch'`. Stripe + shipping address. The existing plugin-ecommerce shipping/fulfillment model fits as-is.
- Reuses: cart, item sheet, checkout, payment, order tracker.

### POS integration (Foodics et al.)
- Anchor: `OrderSink` interface (default = our kanban). Menu items carry an optional `posItemId` per provider. Adapters subscribe to order state changes and call POS APIs; can also push availability changes back.
- A POS-connected branch turns off our Live Orders Board for that branch (or runs both).

### Recommendations: regulars / suggestions / FBT
- Anchor: order line-item history is queryable per session + per saved account. Three recommendation surfaces planned:
  - **Regulars** — before menu opens: "Your usual: Spanish Latte L + Salty Beef Truffle Bagel".
  - **Suggestions** — on item sheet: "Pairs well with: Kult Made Cookies".
  - **Frequently bought together** — at cart view, before pay.
- MVP captures the data (anonymized session → items + branch + time) so models have substrate later.

### AI features
- Order-building assistant: "I want a strong sweet drink for a hot day" → builds a cart.
- Smart customization: "make it dairy-free" → swaps modifier choices, flags incompatibilities.
- Upsell whisperer: post-cart suggestion engine ("Add a croissant for 75 LE more?").
- Anchor: menu data structure is rich enough (modifier groups, allergens, nutritional info) for LLM tool-calling. Add a `/api/ai/assistant` route later that consumes the menu + cart and proposes mutations.

### Other deferred (no architectural anchor needed)
- Loyalty, reservations, SMS/WhatsApp notifications, web push, split bill, open-tab dine-in, real-time table occupancy, thermal printers, separate kitchen-vs-waiter UI, multi-tenant self-serve signup.

## 12. Architectural commitments

These are decisions captured as soft contracts now to avoid future pain:

1. **`OrderSink` interface** from day 1 (`publishTicket`, `updateAvailability`). MVP implementation = the kitchen kanban. Future implementations = POS adapters.
2. **`PaymentProvider` interface** from day 1 (`createIntent`, `capture`, `refund`, `handleWebhook`, `allowedFulfillmentModes`). MVP implementations: `StripeProvider`, `CashOnPickupProvider`.
3. **`restaurantId` reserved** on every restaurant-scoped collection.
4. **`locationId` (= branchId) required** on tables, orders, and branch-level menu-item overrides.
5. **Order line items snapshot rates** (vatPercent, serviceChargePercent) at order-creation time so historical orders are immutable.
6. **`fulfillmentMode` is a first-class field** on Cart and Order from day 1, with the four values `dine-in | pickup | delivery | merch` accepted even though MVP only ships the first two.
7. **Menu image and hotspots are decoupled** from menu items: a menu item can exist without ever being placed on a hotspot, and a hotspot is a thin link record. This lets the structured list keep working when no image exists.
8. **No client-side Effect TS** — server side only, per CLAUDE.md.

## 13. Success criteria (KK launch)

- A guest can sit at a Koffee Kulture table, scan the QR, order a Flat White (large, oat milk, extra shot), pay by card, and see the kitchen ticket appear on the staff board within 5 seconds — without ever creating an account.
- The same guest can scan a pickup QR on the way to work, order ahead, pay, and get a tracker page they can keep open.
- The KK manager can mark "Salty Beef Truffle Bagel" as 86 from their phone; within 5 seconds the customer-facing menu shows it dimmed.
- The KK manager can add a new table, print a QR tent PDF, and have it work on first scan.
- The KK manager can change a price on the Maadi branch without touching other branches.
- All customer-facing surfaces render correctly at 320px viewport in both `en` and `ar` (RTL).

## 14. Open questions (parked, not blocking MVP)

- **Loyalty data model.** Will it be coupon-based (re-use `discount-codes`) or points-based? Defer until KK asks.
- **Receipt fiscal printing.** Egypt has e-invoicing requirements for VAT-registered businesses (ETA). Does KK need their orders pushed to ETA? Check before MVP launch.
- **Refund flow for cash-on-pickup.** If a customer doesn't show up, who eats the cost? Need policy from KK.
- **Branch open/closed hours.** When a branch is "closed," can it still accept "schedule for later" pickup orders? Probably yes; confirm with KK.
- **Hotspot authoring on mobile.** Drawing rectangles is a desktop interaction; mobile authoring is awkward. MVP = desktop-only authoring.
- **Multi-currency.** All KK = LE. Template-level: do we want EGP-only or full multi-currency? Defer.
- **Image-overlay menu vs SEO.** The menu image's content is invisible to crawlers. If SEO matters, the structured list view needs to be the SSR'd default for bots (UA-sniff or noscript path).

---

_Last updated: 2026-05-30 — initial requirements draft._
