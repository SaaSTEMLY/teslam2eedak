# Phase 3: Seed Data

Rewrite demo data to match your brand. All seed data is in `src/endpoints/seed/`.

## 3.1 Product Data

**`src/endpoints/seed/index.ts`:**

- **Product name and slug**: Change `"SaaStarter"` / `"saastarter"` to your product
- **Product descriptions**: `productDescription` Record — en/ar/es
- **Product intro text**: `productIntro` Record — en/ar/es
- **Tech stack line**: Update or remove
- **Feature matrix**: Replace features list and tier names with your product tiers/plans
- **Variant names and prices**: Update tier names (Basic/Pro/etc.) and pricing

```ts
const variants = [
  {
    en: "Basic",
    ar: "أساسي",
    es: "Básico",
    option: basicOption.id,
    price: 900,
  },
  { en: "Pro", ar: "احترافي", es: "Pro", option: proOption.id, price: 2900 },
];
```

## 3.2 FAQ Seed Data

**`src/endpoints/seed/index.ts`** — Replace all 8 FAQ entries. Each needs en/ar/es translations:

```ts
{
  order: 1,
  en: { question: "What is YourBrand?", answer: "YourBrand is..." },
  ar: { question: "ما هو YourBrand؟", answer: "YourBrand هو..." },
  es: { question: "¿Qué es YourBrand?", answer: "YourBrand es..." },
}
```

## 3.3 Blog Seed Data

**`src/endpoints/seed/blogs/`** — Each file exports localized content (en/ar/es):

- `why-we-built-saastarter.ts` → Rename and rewrite
- `architecture-behind-saastarter.ts` → Rename and rewrite
- `setting-up-stripe-payments.ts` → Keep or rewrite

**`src/endpoints/seed/blogs/index.ts`** — Update barrel exports.

## 3.4 Re-seed

```bash
rm -rf sqlite-data/    # Delete existing database
bun dev                # Auto-creates DB and runs schema push
# Trigger seed via admin panel or API endpoint
```
