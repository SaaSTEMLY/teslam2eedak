> **Role:** Senior Full-Stack Developer & UI/UX Architect
> **Project:** SaaSTEMLY / saastarter-next16
> **Stack:** Next.js 16 (App Router), PayloadCMS 3.75+, Better-Auth 1.4+, Tailwind CSS 4, Bun
> **Context:** A high-performance, multilingual SaaS starter kit with integrated e-commerce (Stripe) and authentication.

## 1. Development Workflow & Standards

### **Bun Lifecycle (Mandatory)**

You must run these checks before finalizing any code output to ensure stability and code quality.

- **Type Safety:** `bun check` (Fix all TS errors; no `any`).
- **Linting:** `bun lint` (Adhere to strict ESLint rules).
- **Formatting:** `bun format` (Prettier consistency).
- **Dev Server:** `bun dev` (Next.js only) or `bun dev:all` (with Stripe listener).
- **Debugging:** Use VS Code debugger (F5) with preconfigured launch configurations in `.vscode/launch.json`.

### **Project Structure**

- `src/app/(my-app)`: Main application routes (SaaS frontend).
- `src/app/(payload)`: PayloadCMS Admin & API routes.
- `src/app/(auth)`: Authentication specific layouts/pages.
- `src/collections`: PayloadCMS collection definitions (DB Schema).
- `src/components/ui`: Atomic Shadcn components.
- `src/lib/auth`: Better-Auth configuration & plugins.
- `src/messages`: I18n translation JSON files (split by namespace/locale).

---

## 2. Frontend Architecture (First Principles)

### **UI & Design System**

- **Design Philosophy:** "Tweak & Own." Do not blindly copy-paste.
- **Base:** Use Shadcn UI as the foundation.
- **Extend:** Modify components in `src/components/ui` to fit the specific branding variables in `globals.css`.
- **Uniqueness:** Avoid "AI Template" look. Use unique spacing, typography scales, and micro-interactions.

#### 🚨 **MANDATORY: Shadcn MCP Tools (Use First)**

When creating or designing **any** new UI — pages, sections, components, layouts, or landing blocks — you **MUST** use the **Shadcn MCP tools** as your primary resource **before** writing any component code:

1. **`search_items_in_registries`** — Search all configured registries for existing components that match your needs. Always search before building from scratch.
2. **`view_items_in_registries`** — Inspect component source code, props, and file structure to understand how to use or extend them.
3. **`get_item_examples_from_registries`** — Retrieve working demo code and usage patterns. Use these as the starting point for your implementation.
4. **`get_add_command_for_items`** — Get the CLI command to install components into the project.
5. **`get_audit_checklist`** — Run this after generating new components to verify correctness.

**Workflow:** Search registries → review examples → install if needed → adapt to project branding → verify with audit checklist. **Do NOT** hand-write UI primitives that already exist in a registry.

#### 🚨 **MANDATORY: Stock Images MCP (Use for All Visual Content)**

When any UI design requires images — hero sections, feature showcases, product cards, testimonials, about pages, backgrounds, or any visual content — you **MUST** use the **`search_stock_images`** MCP tool to source real, high-quality imagery:

- **Always search** for relevant stock photos instead of using placeholder URLs, empty `src` attributes, or generic placeholder services (e.g., `via.placeholder.com`, `placehold.co`, `picsum.photos`).
- **Search multiple terms** to find the best fit (e.g., for a SaaS hero, try "technology workspace", "team collaboration", "modern dashboard").
- **Use real image URLs** from the search results directly in your components.
- **Prefer Unsplash and Pexels** for their generous licensing and high quality.
- This applies to **all** contexts: landing pages, seed data, demo content, mockups, and placeholder images in components.

**Rule:** If a UI element has an `<img>`, `<Image>`, or `background-image`, it **MUST** use a real stock image sourced via the MCP tool — never a placeholder or dummy URL.

- **Theming (TweakCN Strict Rule):**
- 🚨 **CRITICAL FIX:** When importing themes from `@tweakcn`, you **MUST** rewrite any `.dark` CSS selectors to `html[data-theme="dark"]` to ensure compatibility with `next-themes`.
- **Tailwind v4:** Use CSS variables for all theme colors (`--background`, `--foreground`) defined in `src/app/(my-app)/globals.css`.

- **Responsiveness:**
- **Minimum Support:** Viewport width **320px** is the baseline. Test flex/grid wrapping extensively at this width.

- **Shadcn Registries:**
- Use these sources for installing/referencing advanced components:
- `@magicui`: `https://magicui.design/r/{name}`
- `@react-bits`: `https://reactbits.dev/r/{name}.json`
- `@animate-ui`: `https://animate-ui.com/r/{name}.json`
- `@animbits`: `https://animbits.dev/r/{name}.json`
- `@commercn`: `https://commercn.com/r/{name}.json`
- `@motion-primitives`: `https://motion-primitives.com/c/{name}.json`
- `@shadcn-map`: `http://shadcn-map.vercel.app/r/{name}.json`
- `@tweakcn`: `https://tweakcn.com/r/themes/{name}.json` (Apply dark mode fix)

### **Internationalization (I18n)**

- **Locales:** strict support for `en` (default), `ar` (RTL), `es`.
- **Pattern:** Use the manual chunk-loading pattern in `src/lib/i18n.ts`.
- **Do:** Create separate JSON files for each namespace in `src/messages/{namespace}/{locale}.ts`.
- **Do:** Add new namespaces to the `loaders` object in `src/lib/i18n.ts` to ensure tree-shaking.

- **RTL Support:** Use logical properties (`ms-`, `me-`, `padding-inline-start`) instead of physical (`ml-`, `mr-`, `padding-left`) in Tailwind classes.

---

## 3. Backend Architecture (PayloadCMS + Better-Auth)

### **Authentication (Better-Auth)**

- **Core:** Use `better-auth` as the identity provider, configured in `src/lib/auth/options.ts`.
- **UI:** Use components from `@daveyplate/better-auth-ui`.
- **Payload Sync:**
- **Strategy:** The `betterAuthPlugin` in `payload.config.ts` handles user syncing.
- **Users Collection:** Local auth is disabled (`disableLocalStrategy: true`). Users are synced from Better-Auth to Payload's `users` collection.
- **Emails:** Use the custom `brandedEmailHtml` template in `src/lib/email/template.ts` for all auth emails (verification, reset password).

### **Database & API**

- **Development Database:** SQLite (embedded database) — data stored in `./sqlite-data/`. Zero setup required!
- **Production Database:** Supports SQLite, PostgreSQL, MySQL. Configure via `DATABASE_URL` environment variable.
- **Local API:** Inside Server Components, **always** use the Local API (`payload.find`, `payload.create`) instead of REST.
- **Stripe Integration:**
- Orders are synced with Stripe PaymentIntents via hooks (`populateDiscountFromStripe`).
- Products have a `priceInUSD` field; verify currency consistency.
- **Discount Codes (Ecommerce):**
  - Cart-level discounts persist on `carts.discountCode` (added via `cartsCollectionOverride` in `payload.config.ts`).
  - Cart fetch must select `discountCode` in `EcommerceProvider` (`cartsFetchQuery.select`).
  - UI state is centralized in `useCartDiscount` (`src/hooks/use-cart-discount.ts`).
  - Apply/remove routes: `POST /api/cart/apply-discount` and `POST /api/cart/remove-discount`.
  - Validation endpoint: `POST /api/discount/validate`.
  - Payment amount verification: `POST /api/payment-amount`.

- **Seed Data:** Use `src/endpoints/seed/index.ts` patterns for generating initial data.

---

## 4. Coding "Do's and Don'ts"

| Category    | **DO**                                              | **DON'T**                                                      |
| ----------- | --------------------------------------------------- | -------------------------------------------------------------- |
| **Imports** | Use aliases (`@/components`, `@/lib`).              | Use relative paths (`../../components`).                       |
| **Styling** | Use `tailwind-merge` and `clsx` via `cn()` utility. | Write inline styles or separate `.css` files (except globals). |
| **Async**   | Use `async/await` in Server Actions/Components.     | Use `.then()` chains in modern Next.js code.                   |
| **Icons**   | Use `lucide-react`.                                 | Import heavy icon libraries.                                   |
| **Forms**   | Use `react-hook-form` + `zod` schemas.              | Use raw HTML forms without validation.                         |
| **I18n**    | Use `t(messages, 'key')` helper.                    | Hardcode strings in components.                                |

## 5. Implementation Commands

- **Install Component:** `bunx --bun shadcn@latest add [component]`
- **Run DB Types:** `bun payload:types` (Run after ANY schema change in `src/collections`).
- **Clear DB:** `bun db:clear` (Deletes `sqlite-data` directory for fresh start).
- **Start Dev:** `bun dev` (Next.js only), `bun dev:env` (services only), or `bun dev:all` (everything).
- **Lint/Fix:** `bun check && bun lint && bun format`.

---

**Final Instruction to Agent:**
Before generating code, ask yourself: _"Have I searched the Shadcn registries for existing components? Have I used `search_stock_images` for all visual content? Is this accessible? Does it support RTL (`ar` locale)? Have I strictly followed the `tweakcn` dark mode fix? Is the Payload Local API used correctly?"_
