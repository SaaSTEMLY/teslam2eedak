# Quick Reference

## All Files with Brand Name ("SaaSTARTER" / "SaaStarter")

| File                                      | What to change                                                                                                      |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/lib/seo.ts`                          | `SITE_NAME`, `SITE_DESCRIPTION`, `TWITTER_HANDLE`, title template                                                   |
| `src/lib/auth/options.ts`                 | Email `from` (x4), email `subject` (x4)                                                                             |
| `src/lib/email/template.ts`               | Uses i18n `brandName` — update via message files                                                                    |
| `src/payload.config.ts`                   | `titleSuffix`, `description`, DB fallback path, OpenAPI metadata: title, description (in `openapi()` plugin config) |
| `src/components/layout/header.tsx`        | Hardcoded brand text                                                                                                |
| `src/components/layout/footer.tsx`        | Hardcoded brand text (x2 — desktop & mobile)                                                                        |
| `src/components/PayloadBranding/Logo.tsx` | Logo alt text                                                                                                       |
| `src/collections/blogs.ts`                | Default author name                                                                                                 |
| `src/app/opengraph-image.tsx`             | OG image alt text                                                                                                   |
| `src/endpoints/seed/index.ts`             | Product name, descriptions, FAQs, tech stack                                                                        |
| `src/endpoints/seed/blogs/*.ts`           | Blog post content                                                                                                   |
| `src/messages/email/{en,ar,es}.ts`        | `brandName`, `allRightsReserved`                                                                                    |
| `src/messages/footer/{en,ar,es}.ts`       | `copyright`                                                                                                         |
| `src/messages/home/{en,ar,es}.ts`         | `ctaButton`, hero text, pricing tier names                                                                          |
| `src/messages/terms/{en,ar,es}.ts`        | Legal entity name                                                                                                   |
| `src/messages/privacy/{en,ar,es}.ts`      | Legal entity name                                                                                                   |
| `src/messages/license/{en,ar,es}.ts`      | Legal entity name                                                                                                   |
| `src/messages/about/{en,ar,es}.ts`        | Company name                                                                                                        |
| `src/lib/docs/shared-schemas.ts`          | `apiInfo` + `publicApiInfo` titles, descriptions, contact; `PUBLIC_CUSTOM_TAGS`/`PUBLIC_PAYLOAD_SLUGS` allowlists   |
| `package.json`                            | `name` field                                                                                                        |

## Environment Variables

```env
# Required
PAYLOAD_SECRET=           # Random 64-char hex
BETTER_AUTH_SECRET=       # Random 64-char hex
NEXT_PUBLIC_BETTER_AUTH_URL=https://yourdomain.com
DATABASE_URL=             # file:./sqlite-data/yourbrand.db (dev) or libsql://... (prod)

# Email (Resend)
RESEND_API_KEY=re_...

# Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# SaaSignal (required — search, analytics, realtime, jobs, recommendations)
SAASIGNAL_TOKEN=

# Storage (optional — production media uploads)
BLOB_READ_WRITE_TOKEN=

# Database Auth (production — Turso)
DATABASE_AUTH_TOKEN=
```
