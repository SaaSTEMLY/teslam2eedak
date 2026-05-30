# Phase 2: Languages & Localization

## 2.1 Supported Locales

**`src/payload.config.ts`** — localization block:

```ts
localization: {
  locales: ["en", "ar", "es"],  // Add/remove locale codes
  defaultLocale: "en",
  fallback: true,
}
```

**`src/lib/locale.ts`** — Update `SupportedLocale` type and validation.

## 2.2 i18n Loader Map

**`src/lib/i18n.ts`** — Each namespace has loaders per locale. **All 22 entries** must be updated when adding/removing locales:

```ts
header: {
  en: () => import("@/messages/header/en"),
  ar: () => import("@/messages/header/ar"),
  es: () => import("@/messages/header/es"),
  // fr: () => import("@/messages/header/fr"),  // example new locale
},
```

## 2.3 Message Files — 22 Namespaces

**Directory:** `src/messages/` — Each namespace has `{locale}.ts` files:

| Namespace         | Path                            | Content               |
| ----------------- | ------------------------------- | --------------------- |
| `about`           | `src/messages/about/`           | About page            |
| `account`         | `src/messages/account/`         | Account settings      |
| `add-card-dialog` | `src/messages/add-card-dialog/` | Payment card dialog   |
| `auth`            | `src/messages/auth/`            | Auth flow             |
| `auth-ui`         | `src/messages/auth-ui/`         | Auth UI components    |
| `blogs`           | `src/messages/blogs/`           | Blog listing/detail   |
| `cart`            | `src/messages/cart/`            | Shopping cart         |
| `checkout`        | `src/messages/checkout/`        | Checkout flow         |
| `contact`         | `src/messages/contact/`         | Contact page          |
| `email`           | `src/messages/email/`           | Email templates       |
| `faq`             | `src/messages/faq/`             | FAQ page              |
| `footer`          | `src/messages/footer/`          | Site footer           |
| `header`          | `src/messages/header/`          | Site header           |
| `home`            | `src/messages/home/`            | Landing page          |
| `legal`           | `src/messages/legal/`           | Legal shared          |
| `license`         | `src/messages/license/`         | License page          |
| `privacy`         | `src/messages/privacy/`         | Privacy policy        |
| `products`        | `src/messages/products/`        | Product pages         |
| `reviews`         | `src/messages/reviews/`         | Product reviews       |
| `search`          | `src/messages/search/`          | Global search (Cmd+K) |
| `terms`           | `src/messages/terms/`           | Terms of service      |
| `wishlist`        | `src/messages/wishlist/`        | Wishlist feature      |

**To add a new locale (e.g., French):**

1. Copy each `en.ts` to `fr.ts` in every namespace directory
2. Translate all string values
3. Add to `src/lib/i18n.ts` loader map (all 22 entries)
4. Add to `src/payload.config.ts` locales array
5. Add to `src/lib/locale.ts` type/validation

## 2.4 RTL Support

**`src/components/layout/header.tsx`** — RTL detection:

```ts
const isRTL = locale?.startsWith("ar");
// Add more: locale?.startsWith("ar") || locale?.startsWith("he")
```

Check all components referencing `isRTL` or directional logic.
