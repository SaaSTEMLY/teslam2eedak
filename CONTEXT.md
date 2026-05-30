# CONTEXT.md — teslam2eedak glossary

> This file is **only a glossary**. No requirements, no design notes, no implementation details. For requirements, see [GOAL.md](./GOAL.md). For engineering conventions, see [CLAUDE.md](./CLAUDE.md). Decisions go in `docs/adr/`.
>
> Update entries inline as terms get sharpened or contradicted. When two terms are close, add a **Not** line that clarifies the boundary.

---

## Restaurant

The brand-and-business that owns one teslam2eedak deployment (e.g., **Koffee Kulture**). One restaurant has one menu and many branches.

**Not** a single physical café — that's a Branch.
**Not** a Tenant — multi-tenancy is deferred; today, one Restaurant = one deployment.

## Branch (a.k.a. Location)

A single physical address belonging to one restaurant (e.g., **KK Maadi**). Owns tables, hours, staff, and per-item availability/price overrides.

**Not** a Restaurant — multiple branches share one menu and one brand.

## Tenant

Reserved for a future multi-tenant world where one teslam2eedak deployment hosts many restaurants. **Not in use today.** The `restaurantId` field is reserved on collections to make this future addition non-breaking.

## Guest

The person eating or picking up. Identified at most by a session cookie (anonymous by default), optionally by an email captured at receipt time. **Not** a Better-Auth User.

## Staff

A floor-and-kitchen role in MVP — one role, one Live Orders Board. Authenticated via Better-Auth. The future split into kitchen-staff vs floor-staff is deferred.

## Manager

A higher-privileged staff role that can author menus, manage tables/branches, and view revenue. Authenticated via Better-Auth.

## Owner

A super-admin with billing, branding, and integration config rights. Authenticated via Better-Auth.

## Menu

The customer-facing catalogue of orderable items, scoped to a Restaurant (with per-Branch overrides). Has two surfaces: the **image-overlay primary view** and the **structured list fallback**.

**Not** a Payload "menu" navigation construct — this is a domain term for what guests see.

## Menu Section

A grouping of menu items (e.g., "Hot Klassiks", "Benedict Kulture"). Often corresponds to one Menu Image.

## Menu Item

A single orderable thing (e.g., "Flat White", "Salty Beef Truffle Bagel"). Implemented as an extended `product` from `@payloadcms/plugin-ecommerce`.

**Not** a Modifier — a milk-swap is a Modifier, not a Menu Item.

## Modifier Group

A reusable named choice list applied to one or more menu items (e.g., "Milk Choice" with Whole / Oat +35 / Almond +35 / Soy +20). Has min/max selectable.

## Modifier Option

One selectable choice inside a modifier group (e.g., "Oat milk +35"). Has a price delta.

## Allergen

A dietary or health tag (vegan, vegetarian, gluten-free, dairy-free, contains nuts, …). Display-only on item cards; powers the Allergen Filter.

## Allergen Filter

A guest-facing header control that dims non-matching items in both menu views. **Does not hide items** — disables add-to-cart with a toast.

## Combo

A group of menu items offered together at a defined discount or fixed combo price. Authored by the manager; selected by the guest in the item sheet.

## Menu Image

A high-resolution image of a printed menu section, uploaded per-locale. The primary customer surface — hotspots are drawn over it.

**Not** a menu-item photo (those go on the Menu Item directly and appear in the item sheet).

## Hotspot

A normalized (0–1) bounding box drawn on a Menu Image, linked to a Menu Item. Tapping a hotspot opens the item sheet.

**Not** a clickable image — it's metadata; the rendering layer overlays the box and intercepts the tap.

## Item Sheet

The bottom-sheet UI that appears when a guest taps a hotspot (or a list item). Shows item photo, description, price, size picker, modifier groups, allergen icons, nutritional info, quantity, free-text note, and add-to-cart.

## Structured List (a.k.a. Fallback List)

The accessibility-first list view of the menu — categories and cards, no image. Always available via header toggle. Default for assistive tech.

## Fulfillment Mode

One of `dine-in | pickup | delivery | merch`. Carried on Cart and Order. Determines payment provider allow-list, tax/service-charge defaults, kitchen ticket header, and tracker copy. All four values are accepted in the schema from day 1 even though MVP only ships `dine-in` and `pickup`.

**Not** Order Status — those are independent axes.

## Cart

A guest's in-progress order, anonymous and session-bound. Has a fulfillment mode, and a tableId (if dine-in) or pickupTime (if pickup). Extended from `@payloadcms/plugin-ecommerce`.

## Order

A paid (or pending-cash) cart, immutable in its priced form. Snapshots the VAT rate and service-charge rate at creation time so historical orders aren't broken when a manager changes percentages.

## Order Status

The kanban state of an order: `placed | preparing | ready | delivered | cancelled`. Advanced by staff on the Live Orders Board.

## Ticket

The staff-facing projection of an Order on the Live Orders Board. In MVP, ticket and order are 1:1. The abstraction exists so a future drinks/food split (one order → two tickets) doesn't break the customer flow.

## Live Orders Board

The 4-state kanban screen used by staff to manage tickets in real time. One board per Branch.

## Table

A physical table at a Branch with a label, optional capacity, and an active/inactive status. Encoded in a Table QR with a short-ID.

**Not** a database table — always refer to the data store as a "collection" per Payload convention.

## QR Artifact

A generated printable PDF (table tent, A4 sheet, or generic pickup QR) carrying a QR code that resolves to a menu URL. Includes restaurant branding.

## Table QR vs Pickup QR

**Table QR** — encodes a specific tableId; lands the guest in dine-in mode. **Pickup QR** — encodes only the branch (no table); lands the guest in click-and-collect mode.

## Click-and-Collect (Pickup)

A guest orders ahead, pays, and walks in to collect at a Branch. ASAP by default; "schedule for later" optional.

## ASAP

A pickup-timing choice that means "queue this order now; ETA is computed from current queue depth and longest-prep item". The Live Orders Board treats ASAP and scheduled orders identically once they enter the queue.

## Cash-on-Pickup

A payment provider where no online payment occurs. Order is created with `paymentStatus: pending`; staff marks `paymentStatus: paid` at handover. **Pickup only** — never available for dine-in.

## VAT (14%)

Egyptian value-added tax. Mandatory, auto-added to every Cart, displayed in the breakdown. Rate is configurable per Restaurant and per Branch; the default for KK is 14%.

## Service Charge (12%)

A mandatory-feeling fee added to dine-in bills, paid to staff. Auto-added to dine-in carts only. Rate is configurable; the default for KK is 12%.

**Not** a Tip.

## Tip

An optional guest-discretionary amount on top of the grand total, added via a slider at checkout. Distinct from Service Charge.

## 86 (verb)

Restaurant slang: to mark an item temporarily unavailable. Modeled as the `isAvailable` toggle plus optional `unavailableUntil`. When 86'd, the item is dimmed-with-badge in both menu views and add-to-cart is disabled.

## Order Sink

The interface (`publishTicket`, `updateAvailability`) implemented by anything that wants to receive confirmed orders. Default = our own Live Orders Board. Future implementations = POS adapters (Foodics, Marn, Square).

**Not** the Live Orders Board itself — the board is one implementation of the sink.

## Payment Provider

The interface (`createIntent`, `capture`, `refund`, `handleWebhook`, `allowedFulfillmentModes`) implemented by anything that wants to charge a Cart. Day-1 implementations: Stripe, CashOnPickup. Future: Paymob, Fawry, Vodafone Cash, Instapay.

## Tracker

The customer-facing post-pay page showing order #, items, current Order Status, ETA, and table or pickup label. Bookmark-able URL; updates live by polling (websocket later).

## Receipt

The transactional record of an Order with VAT/service-charge breakdown. Always renderable from the Tracker URL; optionally emailed if the guest opted in.

## Rebrand

The act of forking teslam2eedak and tailoring it to a specific restaurant (KK being the first). Driven by the global `rebrand` skill referenced in [CLAUDE.md](./CLAUDE.md).

## Kulture (the K-naming)

KK's brand convention of replacing the leading "C" in food words with "K" (Hot Klassiks, Blended Koffee, Kult Made Cookies, Bagels Kulture). Preserve in all KK-instance copy.

**Not** a typo. **Not** a translation issue. It's brand voice.

---

_Last updated: 2026-05-30 — initial draft. Add entries inline as terms get used or sharpened in conversation._
