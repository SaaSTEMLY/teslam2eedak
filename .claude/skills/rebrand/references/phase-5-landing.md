# Phase 5: Landing Page

## 5.1 SEO & Metadata (Critical)

**`src/lib/seo.ts`** — Single source of truth for all site-wide metadata:

```ts
export const SITE_NAME = "YourBrand";
export const SITE_DESCRIPTION = "Your brand description";
export const TWITTER_HANDLE = "@yourbrand";

title: {
  default: `${SITE_NAME} - Your Tagline`,
  template: `%s | ${SITE_NAME}`,
},
```

Auto-propagates to: PWA manifest, OpenGraph, Twitter cards, Apple Web App title, sitemap.

## 5.2 OpenGraph Image

**`src/app/opengraph-image.tsx`:**

```ts
alt = "YourBrand - Your tagline";
// Update gradient colors, logo reference, text content
```

## 5.3 Logo & PWA Icons

Replace all files in `public/logo/main/` — see [Phase 4](./phase-4-theming.md) sections 4.1-4.2.

## 5.4 Header & Footer Brand Name

**`src/components/layout/header.tsx`** — Replace `SaaSTARTER` with brand name.

**`src/components/layout/footer.tsx`** — Replace `SaaSTARTER` in both desktop and mobile layouts. Update social links:

```ts
const socialLinks = [
  { label: m.github, href: "https://github.com/yourbrand", icon: Github },
  { label: m.twitter, href: "https://twitter.com/yourbrand", icon: Twitter },
  {
    label: m.linkedin,
    href: "https://linkedin.com/company/yourbrand",
    icon: Linkedin,
  },
];
```

## 5.5 Landing Page Messages

**`src/messages/home/{en,ar,es}.ts`** — Key sections:

```ts
heroTagline: "Your Product Category",
heroTitle: "Your headline.",
heroTitleFaded: "Your subheadline.",
heroDescription: "Your value proposition.",
planFrontendLiteName: "Starter",           // tier names
planFrontendProName: "Professional",
testimonial1Quote: "Your testimonial...",
ctaButton: "Get YourBrand",
newsletterTitle: "Your newsletter headline",
bentoTitle: "Your bento section headline",
pricingBadge: "Your pricing badge text",
```

**`src/messages/footer/{en,ar,es}.ts`:**

```ts
tagline: "Your brand tagline.",
copyright: "\u00A9 2026 YourBrand. All rights reserved.",
newsletterTitle: "...",
newsletterPlaceholder: "...",
newsletterButton: "...",
newsletterSuccess: "...",
```

## 5.6 Landing Page Components

These pull text from i18n — verify visual layout:

| Component    | File                                              | Check                         |
| ------------ | ------------------------------------------------- | ----------------------------- |
| Hero         | `src/components/landing/hero-section.tsx`         | Layout, animations, CTA links |
| Features     | `src/components/landing/features-section.tsx`     | Icons, grid layout            |
| Pricing      | `src/components/landing/pricing-section.tsx`      | Tier count, pricing display   |
| Testimonials | `src/components/landing/testimonials-section.tsx` | Avatar images, layout         |
| FAQ          | `src/components/landing/faq-section.tsx`          | FAQ source (CMS vs static)    |
| Final CTA    | `src/components/landing/final-cta.tsx`            | CTA link, newsletter form     |
| Logo Marquee | `src/components/landing/logo-marquee.tsx`         | Partner/tech logos            |
| Bento Grid   | `src/components/landing/bento-grid.tsx`           | Feature highlights            |
