# Phase 1: CMS Config

Configure admin panel, database, collections, globals, and SEO infrastructure.

## 1.1 Project Identity

**`package.json`** — Change `"name"` field from `"saastarter-next16"` to your brand.

## 1.2 Admin Panel Branding

**`src/payload.config.ts`** — `admin` block:

```ts
admin: {
  meta: {
    titleSuffix: "- YourBrand",           // was "- SaaStarter"
    description: "YourBrand Admin Panel",  // was "The best admin panel in the world"
  },
  // components.graphics.Icon and Logo reference src/components/PayloadBranding
  // beforeDashboard: optional welcome banner — customize or remove
}
```

**`src/components/PayloadBranding/Logo.tsx`** — Update logo alt text to your brand name.

**`src/components/BeforeDashboard/index.tsx`** — Customize or remove by deleting the `beforeDashboard` line from `payload.config.ts`.

## 1.3 Database Name

**`.env`:**

```env
DATABASE_URL=file:./sqlite-data/yourbrand.db
```

**`src/payload.config.ts`** — Update fallback DB path:

```ts
return dbUrl || "file:./sqlite-data/yourbrand.db";
```

## 1.4 Product Categories

Both files must have **identical** category values:

**`src/payload.config.ts`** — Product categories `options` array:

```ts
options: [
  {
    label: { en: "Your Category", ar: "فئتك", es: "Tu Categoría" },
    value: "your-category",
  },
];
```

**`src/collections/discount-codes.ts`** — `appliesToCategories.options` — keep in sync with above.

## 1.5 Blog Collection

**`src/collections/blogs.ts`:**

- Default author: change `"SaaSTARTER Team"` to your brand
- Blog categories `options` array: customize for your content topics

## 1.6 Collections Needing No Changes

FAQs, Contact, Media, Discount Codes (except categories above), Reviews, Wishlists, Newsletter Subscribers — all generic.

## 1.7 Auth Card Accent Colors

**`src/app/(my-app)/globals.css`** — Search for `oklch(0.6397 0.172 36.4421` and replace with your brand's OKLCH primary color in these locations:

- Input focus glow `box-shadow`
- Social button hover shimmer
- Auth card focus border gradient
- Checkbox focus ring

Convert hex to OKLCH at [oklch.com](https://oklch.com). Leave `oklch(0.6368 0.2078 25.3313)` (destructive red) unchanged.

## 1.8 SEO Infrastructure

These auto-configure from `src/lib/seo.ts` (Phase 5) — no separate changes needed:

| File                          | Purpose                                             |
| ----------------------------- | --------------------------------------------------- |
| `src/app/manifest.ts`         | PWA manifest — uses `SITE_NAME`, `SITE_DESCRIPTION` |
| `src/app/robots.ts`           | Search engine rules — uses `SITE_URL`               |
| `src/app/sitemap.ts`          | Dynamic sitemap — uses `SITE_URL`                   |
| `src/app/opengraph-image.tsx` | OG image — update in Phase 5                        |

## 1.9 Avatar Style (DiceBear)

**`src/app/api/avatar/route.ts`** — Default style is `notionists`. To change:

1. Pick style from [dicebear.com/styles](https://www.dicebear.com/styles/)
2. `bun add @dicebear/your-chosen-style`
3. Update import and `createAvatar` call
4. `bun remove @dicebear/notionists`

Related files (no changes needed — they call the API route): `src/lib/avatar.ts`, `src/lib/auth-client.ts`, `src/components/PayloadBranding/Avatar.tsx`

## 1.10 SaaSignal Configuration

**`.env`:**

```env
SAASIGNAL_TOKEN=your_saasignal_token
```

Powers: global search (Cmd+K), admin analytics, realtime order updates, background jobs, product recommendations.

Key files: `src/lib/saasignal.ts`, `src/lib/saasignal-sync.ts`, `src/hooks/use-saasignal-channel.ts`, `src/app/api/saasignal/browser-token/route.ts`, `src/app/api/jobs/process/route.ts`

## 1.11 API Documentation

**`src/payload.config.ts`** — Update the `openapi()` plugin metadata in the plugins array:

```ts
openapi({
  openapiVersion: "3.1",
  specEndpoint: "/api/payload-spec.json",
  metadata: {
    title: "YourBrand API",
    version: "1.0.0",
    description: "Your brand's API description.",
  },
}),
```

**`src/lib/docs/shared-schemas.ts`** — Update **both** info objects:

- `apiInfo` (full/admin docs): title, description, contact.email
- `publicApiInfo` (storefront docs): title, description, contact.email, Quick Start guide

Also review:

- `PUBLIC_CUSTOM_TAGS` — add/remove tags if you changed custom route tags
- `PUBLIC_PAYLOAD_SLUGS` — add/remove slugs if you added custom collections

After updating:

1. Regenerate API client types: `bun run api:types`
2. Run integration tests: `bun run test` — the `api-docs.test.ts` suite verifies brand name in the spec
3. Verify visually:
   - `/api/docs` — Public Scalar UI shows your brand name (storefront endpoints only)
   - `/api/admin/docs` — Admin Scalar UI shows all endpoints
   - `/api/openapi.json` — `info.title` and `info.contact` are correct
   - `/llms.txt` — Header shows your brand (storefront endpoints only)
