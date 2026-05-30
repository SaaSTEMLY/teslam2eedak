# Phase 6: Email Templates, Basic Pages, FAQs, Contact, Blogs & Newsletter

These can be done concurrently — no dependencies between them.

## 6.1 Email Templates

**`src/lib/email/resend.ts`** — Update the `from` field with your brand name and verified Resend domain:

```ts
from: "YourBrand <noreply@yourdomain.com>",
```

**`src/lib/auth/options.ts`** — Replace all `"SaaSTARTER"` in email `subject` fields (4 locations):

```ts
subject: "Reset Your Password — YourBrand";
subject: "Verify Your Email — YourBrand";
subject: "Confirm Email Change — YourBrand";
subject: "Confirm Account Deletion — YourBrand";
```

**`src/messages/email/{en,ar,es}.ts`:**

```ts
brandName: "YourBrand",
allRightsReserved: "© {year} YourBrand. All rights reserved.",
```

**`src/lib/email/order-confirmation.ts`** — Update hardcoded brand references.

**`src/lib/email/order-status.ts`** — Update brand colors and copy.

## 6.2 About Page

**`src/messages/about/{en,ar,es}.ts`** — Rewrite: mission, team, company story.
**`src/app/(my-app)/about/page.tsx`** — Update page metadata.

## 6.3 Terms of Service

**`src/messages/terms/{en,ar,es}.ts`** — Replace all legal text. Search for "SaaSTARTER".

## 6.4 Privacy Policy

**`src/messages/privacy/{en,ar,es}.ts`** — Replace all privacy text. Update data practices, third-party services, contact info.

## 6.5 License Page

**`src/messages/license/{en,ar,es}.ts`** — Replace with your license terms.

## 6.6 Legal Shared Text

**`src/messages/legal/{en,ar,es}.ts`** — Shared text across terms/privacy/license pages.

## 6.7 FAQ Page

FAQs come from PayloadCMS. To rebrand:

1. Update seed data (Phase 3)
2. Or manage in admin at `/admin/collections/faqs`

**`src/messages/faq/{en,ar,es}.ts`** — Update page-level UI text.

## 6.8 Contact Page

**`src/messages/contact/{en,ar,es}.ts`** — Update form labels, descriptions, address/email references.
**`src/app/api/contact/route.ts`** — Verify submission handler.

## 6.9 Blog Pages

**`src/messages/blogs/{en,ar,es}.ts`** — Update listing/detail page UI text.
Blog content managed at `/admin/collections/blogs`. Seed data in Phase 3.

## 6.10 Newsletter

**Component:** `src/components/newsletter/newsletter-form.tsx` — No brand content; text from i18n.
**API:** `src/app/api/newsletter/route.ts`
**Admin:** `/admin/collections/newsletter-subscribers`
Footer text covered in Phase 5.
