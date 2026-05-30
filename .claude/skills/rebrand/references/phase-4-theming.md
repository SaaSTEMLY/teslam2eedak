# Phase 4: Color Scheme, Logo & Theming

## 4.1 Replace Logo SVG

**`public/logo/main/raw.svg`** — Replace entirely. Requirements:

- Square (512x512 viewBox recommended)
- Works at favicon size (48x48) — keep simple
- Use brand's primary color

**Quick templates:**

Rounded rectangle with initials:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#YOUR_BG_COLOR"/>
  <text x="256" y="280" text-anchor="middle" font-family="system-ui, sans-serif"
    font-size="180" font-weight="700" fill="#YOUR_TEXT_COLOR">YB</text>
</svg>
```

Circle monogram:

```svg
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <circle cx="256" cy="256" r="240" fill="#YOUR_PRIMARY_COLOR"/>
  <text x="256" y="300" text-anchor="middle" font-family="system-ui, sans-serif"
    font-size="220" font-weight="700" fill="white">Y</text>
</svg>
```

## 4.2 Generate PWA Icons

```bash
bun run pwa:generate
```

Config: `pwa-assets.config.ts` → points to `public/logo/main/raw.svg`

Generates in `public/logo/main/`: `favicon.ico` (48x48), `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`

## 4.3 OG Image

**`src/app/opengraph-image.tsx`:**

```ts
export const alt = "YourBrand - Your tagline";
// Update gradient background to match brand
background: "linear-gradient(135deg, #YOUR_BG 0%, #YOUR_BG2 50%, #YOUR_BG 100%)",
```

## 4.4 Choose a Color Scheme

47 pre-built schemes in `public/colorSchemes/`:

`amber-minimal` · `amethyst-haze` · `bold-tech` · `bubblegum` · `caffeine` · `candyland` · `catppuccin` · `claude` · `claymorphism` · `clean-slate` · `cosmic-night` · `cyberpunk` · `darkmatter` · `default` · `doom-64` · `elegant-luxury` · `graphite` · `kodama-grove` · `midnight-bloom` · `mocha-mousse` · `modern-minimal` · `mono` · `nature` · `neo-brutalism` · `northern-lights` · `notebook` · `ocean-breeze` · `pastel-dreams` · `perpetuity` · `quantum-rose` · `retro-arcade` · `sage-garden` · `soft-pop` · `solar-dusk` · `starry-night` · `sunset-horizon` · `supabase` · `t3-chat` · `tangerine` · `twitter` · `vercel` · `vintage-paper` · `violet-bloom`

Preview: `bun dev` → color scheme switcher in header (palette icon).

**`src/app/(my-app)/globals.css`:**

```css
@import "../../../public/colorSchemes/your-chosen-scheme.css";
```

## 4.5 Custom Color Scheme

Copy `public/colorSchemes/default.css` → `public/colorSchemes/yourbrand.css`. Key variables:

```css
:root {
  --background: oklch(/* light bg */);
  --foreground: oklch(/* light fg */);
  --primary: oklch(/* brand primary */);
  --primary-foreground: oklch(/* text on primary */);
  --secondary: oklch(...);
  --accent: oklch(...);
  --muted: oklch(...);
  --destructive: oklch(...);
  --border: oklch(...);
  --ring: oklch(...);
  --radius: 0.625rem;
  --font-sans: "Your Font", sans-serif;
  --font-serif: "Your Serif", serif;
  --font-mono: "Your Mono", monospace;
}
html[data-theme="dark"] {
  /* all dark mode overrides */
}
```

**CRITICAL:** When importing tweakcn themes, rewrite `.dark` → `html[data-theme="dark"]`.

Tools: [oklch.com](https://oklch.com) (hex→OKLCH), [tweakcn.com](https://tweakcn.com) (visual builder)

## 4.6 Font Configuration

**`src/lib/color-scheme-fonts.ts`** — Add your scheme's Google Fonts:

```ts
"yourbrand": ["Your+Font:wght@400;500;600;700", "Your+Serif:wght@400;700"],
```

## 4.7 Email Template Colors

**`src/lib/email/template.ts`:**

| What                   | Current                                             | Change to           |
| ---------------------- | --------------------------------------------------- | ------------------- |
| CTA button background  | `#d4722a`                                           | Your brand primary  |
| Email body background  | `#f5f3f0`                                           | Your brand light bg |
| Brand name font        | `Georgia, 'Times New Roman', serif`                 | Your brand font     |
| Header banner gradient | `linear-gradient(135deg, #d4722a 0%, #e8944d 100%)` | Your brand gradient |

**`src/lib/email/order-confirmation.ts`** — Same color references.

**`src/messages/email/{en,ar,es}.ts`** — `orderQuestionsPrompt` has hardcoded `#d4722a` link color.

## 4.8 PWA Theme Color

**`src/app/manifest.ts`:**

```ts
theme_color: "#0a0a0a",       // brand theme bar color
background_color: "#ffffff",   // splash screen background
```
