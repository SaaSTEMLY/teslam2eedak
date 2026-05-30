# AUTO Mode Details

## Brand Interview Questions

### Core Identity

| #   | Question                                                                  | Purpose                             |
| --- | ------------------------------------------------------------------------- | ----------------------------------- |
| 1   | **What is your product/company name?**                                    | Brand name used everywhere          |
| 2   | **What does your product do? (one sentence)**                             | Hero copy and meta descriptions     |
| 3   | **Who is your target audience?** (developers, SMBs, enterprise, creators) | Tone, copy style, imagery           |
| 4   | **What problem does your product solve?**                                 | Value proposition and CTA messaging |

### Visual Direction

| #   | Question                                                                                                                                                                        | Purpose                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| 5   | **Brand colors?** Hex codes, or mood: bold & energetic, calm & trustworthy, dark & premium, playful & fun                                                                       | Color scheme selection/creation |
| 6   | **Logo?** Provide file, or generate text-based placeholder?                                                                                                                     | Phase 4 logo setup              |
| 7   | **Aesthetic?** Examples of sites you like, or pick: `minimal` · `brutalist` · `glassmorphism` · `neo-corporate` · `playful` · `editorial` · `dark-luxury` · `retro` · `organic` | Creative direction for concepts |

### Content & Tone

| #   | Question                                                                                                | Purpose                                     |
| --- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 8   | **Copy tone?** Blend of: `professional` · `casual` · `witty` · `technical` · `inspirational` · `direct` | All copy generation                         |
| 9   | **Testimonials/social proof?** Real ones, or generate placeholders?                                     | Testimonials section                        |
| 10  | **3-5 key features or selling points?**                                                                 | Features section, bento grid, pricing tiers |

### Optional

| #   | Question                                                           | Purpose                         |
| --- | ------------------------------------------------------------------ | ------------------------------- |
| 11  | **Pricing tiers?** (names, prices, features) or propose them?      | Pricing section and seed data   |
| 12  | **Existing copy?** (tagline, about, legal) or generate everything? | How much copy to write vs reuse |
| 13  | **Languages?** Keep en/ar/es, or change/add?                       | Scope Phase 2 work              |

**After collecting:** Summarize brand profile back to user. Get confirmation before proceeding.

---

## Concept Generation

### 10 Concepts — Variation Dimensions

Each of the 10 concepts must vary across:

| Dimension             | Variations                                                         |
| --------------------- | ------------------------------------------------------------------ |
| **Layout**            | Hero left-aligned / centered / split-screen / full-bleed           |
| **Typography scale**  | Massive display / refined editorial / compact modern               |
| **Color application** | Monochrome+accent / gradient-heavy / duotone / full palette        |
| **Animation style**   | Subtle fades / scroll-triggered reveals / parallax / kinetic text  |
| **Section order**     | Hero→Features→Pricing→CTA / Hero→Social Proof→Bento→Pricing / etc. |
| **Hero style**        | Text-only / text+illustration / text+product screenshot / video bg |
| **Visual density**    | Airy/spacious / balanced / dense/information-rich                  |
| **CTA approach**      | Single dominant CTA / multiple CTAs / embedded demo                |

### Generation Rules

1. Use the project's real component system: Shadcn UI, Tailwind v4, `cn()`, lucide-react
2. Each concept = valid React component for `src/components/landing/`
3. Apply user's brand colors (or propose from 47 available schemes)
4. Write real copy from interview — no lorem ipsum
5. Support RTL with logical properties (`ms-`/`me-`/`ps-`/`pe-`)
6. Use `search_stock_images` MCP for all imagery
7. Use `search_items_in_registries` before building new components

### Presentation Format

Each concept gets:

- **Name and 1-line description** (e.g., `Concept 1: "Midnight Minimal"` — Dark, spacious hero with massive headline)
- **Key visual characteristics** (colors, typography, layout)
- **Color scheme** (which of the 47, or custom)

User can: pick one → proceed | request tweaks | mix-and-match | request more

---

## Vibe Reference Template

After landing page is locked in, extract:

```
VIBE REFERENCE
──────────────
Brand Name:       [from interview]
Color Scheme:     [chosen scheme name or custom file]
Primary Color:    oklch(...)
Typography:       [font family, scale ratios]
Tone:             [from interview]
Border Radius:    [value from scheme]
Animation Style:  [subtle/moderate/bold]
Layout Density:   [spacious/balanced/dense]
Visual Motifs:    [gradients, grain, glassmorphism, sharp corners, etc.]
Section Patterns: [preferred layouts from the landing page]
```

This guides the stylistic direction for all remaining phases.
