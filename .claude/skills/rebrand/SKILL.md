---
name: rebrand
description: "Rebrand a SaaS starter kit into a new product — AUTO mode (interview + concepts + full execution) or manual phase-by-phase."
---

# Rebrand

Rebrand a SaaS starter kit (Next.js, PayloadCMS, Better-Auth, Tailwind v4, Stripe) into a new product. $ARGUMENTS determines the mode.

| Argument            | Behavior                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| _(empty)_ or `auto` | Full AUTO mode: interview → 10 concepts → pick → implement all 9 phases        |
| `phase N`           | Run only phase N (1-9) — see [phase reference files](./references/)            |
| `all`               | Run all 9 phases sequentially (skip interview, infer brand from existing code) |
| `interview`         | Run only the brand interview                                                   |
| `concepts`          | Run only concept generation (requires prior interview answers in context)      |

## Prerequisites

1. Ensure `bun dev` is running so changes can be previewed live.
2. **Quality gate:** Run `bun check && bun lint` after every phase. Fix all errors before proceeding.
3. **Baseline tests:** Run `bun run test` before starting. All 67 integration tests should pass. This is your safety net — run tests between phases to catch regressions early.

---

## AUTO Mode

### Step 1: Brand Interview

See [auto-mode.md](./references/auto-mode.md) for the full question set with purposes.

Ask all applicable questions conversationally, adapting follow-ups based on answers. Collect ALL answers, then summarize the brand profile back to the user for confirmation before Step 2.

### Step 2: Generate 10 Landing Page Concepts

See [auto-mode.md](./references/auto-mode.md) for variation dimensions and generation rules.

Each concept must use the project's real component system (Shadcn UI, Tailwind v4, `cn()`, lucide-react), write real copy from the interview, and support RTL. Present all 10 as a numbered list with name, 1-line description, color scheme, and key visual traits.

User can: pick one, request tweaks, mix-and-match, or request more variations.

### Step 3: Refine & Lock In

Implement the chosen concept into:

- Components: `src/components/landing/`
- Page: `src/app/(my-app)/page.tsx`
- i18n: `src/messages/home/{en,ar,es}.ts`
- Color scheme: `public/colorSchemes/` and `globals.css`

Run `bun dev` for live preview. Iterate until satisfied.

### Step 4: Extract Vibe Reference

See [auto-mode.md](./references/auto-mode.md) for the vibe reference template. Document the locked-in design decisions to guide all remaining phases.

### Step 5: Execute Phases 1-9

Work through each phase applying the vibe reference. Phase 5 (Landing Page) is already done — just verify SEO metadata.

---

## Phase Execution

Each phase has a dedicated reference file with exact file paths and code changes.

| Phase | Focus            | Reference                                                 |
| ----- | ---------------- | --------------------------------------------------------- |
| 1     | CMS Config       | [phase-1-cms.md](./references/phase-1-cms.md)             |
| 2     | Languages & i18n | [phase-2-i18n.md](./references/phase-2-i18n.md)           |
| 3     | Seed Data        | [phase-3-seed.md](./references/phase-3-seed.md)           |
| 4     | Theming          | [phase-4-theming.md](./references/phase-4-theming.md)     |
| 5     | Landing Page     | [phase-5-landing.md](./references/phase-5-landing.md)     |
| 6     | Pages & Email    | [phase-6-pages.md](./references/phase-6-pages.md)         |
| 7     | Ecommerce        | [phase-7-ecommerce.md](./references/phase-7-ecommerce.md) |
| 8     | Auth             | [phase-8-auth.md](./references/phase-8-auth.md)           |
| 9     | Final Checklist  | [phase-9-checklist.md](./references/phase-9-checklist.md) |

Also see [quick-reference.md](./references/quick-reference.md) for the full brand-name file list and env vars.

---

## Shared Rules

- **Shadcn MCP:** Use `search_items_in_registries` → `view_items_in_registries` → `get_item_examples_from_registries` before building any new UI.
- **Stock Images:** Use `search_stock_images` for all `<img>`/`<Image>` sources — never use placeholder URLs.
- **i18n:** All copy in en, ar (RTL), es. Use `t(messages, 'key')` — never hardcode strings.
- **RTL:** Logical CSS properties only (`ms-`/`me-`/`ps-`/`pe-`, not `ml-`/`mr-`/`pl-`/`pr-`).
- **tweakcn:** Rewrite `.dark` selectors to `html[data-theme="dark"]` for next-themes compatibility.
- **Quality:** Run `bun check && bun lint` after every phase. Fix before continuing.
- **Testing:** Run `bun run test` after phases that touch API routes, schemas, or collections (especially phases 1, 3, 7). If a test fails, fix the root cause before continuing — tests catch real regressions.
- **API Types:** After modifying route schemas (`src/app/api/*/schema.ts`) or collection fields, regenerate API types: `bun run api:types`. This updates the typed client used by both the frontend and tests.
- **Phase 9:** Walk the user through the full verification checklist.

### Backend Code Standards

When adding or modifying API routes, services, or backend logic during rebranding, follow these rules strictly. Use the `/typescript-types-best-practices` and `/effect-errors` skills for guidance.

**Effect Services & DI:**
- All reusable business logic belongs in Effect services (`src/lib/effect/services/`), not inline in route handlers.
- Existing services: `Auth`, `Payload`, `StripeService`, `Discount`, `CartService`. Use them — don't duplicate their logic.
- When adding a new domain (e.g., subscriptions, inventory, notifications), create a new Effect service: `Context.Tag` + `Layer.effect` in `src/lib/effect/services/`, wire its `Live` layer into `AppLive` in `layers.ts`, export from `index.ts`.
- Route handlers should be thin: parse input → call services → return response.
- Use `checkRateLimit()` from `@/lib/effect/rate-limit` for rate-limited endpoints — never copy-paste in-memory maps.
- Use `auth.requireAdmin` for admin-only routes — never inline role checks.

**Effect Error Handling:**
- All domain errors use `Data.TaggedError` from `@/lib/effect/errors.ts`.
- New error types go in `errors.ts` and must be added to the `HttpError` union + `errorToResponse()` switch.
- Use `yield* new ErrorType({...})` for domain failures (not `throw`).
- Use `Effect.tryPromise()` for external calls, mapped to `ExternalServiceError`.
- Non-critical side effects use `Effect.catchAll` with logging — never silently swallow via `Effect.either`.

**Type Safety:**
- No `any`. No `eslint-disable no-explicit-any`. No `as unknown as`.
- Use `as` only at type boundaries (Payload `docs[0]` returns `unknown`, Stripe API returns unions with deleted types).
- Use type guards (`isSessionUser()`, `hasRole()`) for runtime shape validation — not blind `as` casts.
- Use `satisfies` for compile-time validation without widening.
- All request bodies validated via `parseBody(zodSchema, req)` — never raw `req.json()` + manual checks.
- Run `bun check` (zero errors) after every backend change.

## Test-Driven Development

The project includes 17 integration test files (`tests/routes/`) covering all public API routes via `openapi-fetch`. Use them as a safety net during rebranding:

1. **Before starting:** `bun run test` — establish the green baseline
2. **After each phase:** `bun run test` — catch regressions immediately
3. **When adding new routes:** Create a matching `tests/routes/{name}.test.ts` following the existing pattern (see `tests/helpers/setup.ts` for auth helpers and cleanup utilities)
4. **When modifying schemas:** Update the corresponding test expectations + run `bun run api:types`
5. **Discount/rate-limited routes:** The discount validation endpoint is rate-limited (10 req/min). If tests hit 429, wait 60s and re-run.

Key commands:

```bash
bun run test                          # Run all tests (or use /test skill)
bun run test -- tests/routes/contact.test.ts  # Run single file
bun run test:watch                    # Watch mode
bun run api:types                     # Regenerate API client types
```

## Skill Maintenance

The project ships with several Claude skills in `.claude/skills/`. During a rebrand, review and update these skills to stay accurate:

| Skill             | When to update              | What to change                                                                                                                                |
| ----------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/seed`           | Phase 3 (Seed Data)         | Update sample data descriptions if product type changes                                                                                       |
| `/deploy-setup`   | Phase 9 (Final)             | If new integrations were added, document them in Phase B's "Common Post-Rebrand Integrations" table so the next user knows how to set them up |
| `/ci`             | If CI pipeline changes      | Update commands or service requirements                                                                                                       |
| `/test`           | If test setup changes       | Update service requirements or troubleshooting table                                                                                          |
| `/quality-review` | If new services are added   | Add service usage checks to the code quality section                                                                                          |
| `/rebrand`        | After completing a rebrand  | Update phase references if you added/removed phases; update service table in Phase 7 if new services were created                             |

After rebrand, run `/deploy-setup b` to configure any new services that were added. The `/ci`, `/test`, and `/quality-review` skills are intentionally generic (no hardcoded paths or brand names) so they work after rebranding without changes. Only update them if the project structure or tooling fundamentally changes.
