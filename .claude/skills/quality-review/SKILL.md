---
name: quality-review
description: "Comprehensive quality and security review — type checking, linting, tests, security audit, API docs, performance analysis."
---

# Quality Review

Run a comprehensive quality and security review. $ARGUMENTS can specify a focus area: `security`, `performance`, `api-docs`, `accessibility`, or a specific file path.

## 1. Automated Checks

Run and report failures:

- `bun check` — TypeScript type checking
- `bun lint` — ESLint linting
- `bun format --check` — Prettier formatting (check only)
- `bun run test` — Integration tests in `tests/` (requires `bun dev` running)
- `bun run api:types` — Regenerate typed API client; if `git diff` shows changes, the types are stale

## 2. Security Review

- **Auth (Session + API Key)**: Better Auth config — CSRF protection, secure cookies, session handling. API key plugin with scoped permissions
- **API Key Scopes**: Verify scope enforcement middleware checks correct permissions on protected routes
- **Public vs Admin API**: Ensure admin endpoints aren't exposed in the public OpenAPI spec — check the shared schemas that control public collection/tag filtering
- **Payload CMS**: Access control on all collections — admin-only collections require role check, user-owned data requires ownership check
- **Stripe**: Webhook signature validation in handler
- **API Routes**: Routes without explicit `security: []` in their schema should enforce auth
- **Email**: In production, Resend API key configured; in dev, emails log to console. No hardcoded sender addresses outside the shared email helper
- **Environment**: No hardcoded secrets in source files; env validation catches missing vars at startup
- **SQL Injection**: Payload query filters properly validated
- **XSS**: User-generated content properly sanitized

## 3. Code Quality

- Unused imports and dead code
- **API routes use Effect TS patterns**: `handleRoute()` + `Effect.gen` + `AppLive` layer — no raw `try/catch` in route handlers
- **Error types**: domain errors use `Data.TaggedError` from `@/lib/effect/errors.ts`, not generic `Error` or string messages
- **Services used correctly**: reusable business logic lives in Effect services (`src/lib/effect/services/`), not duplicated inline in routes:
  - **Auth**: routes use `yield* auth.requireUser` or `yield* auth.requireAdmin` — no inline role checking
  - **Stripe**: routes use `yield* StripeService` for customer/payment operations — no direct `stripe.` SDK calls in route files
  - **Discount**: routes use `yield* Discount` for validation — no duplicated discount logic or self-fetch anti-patterns
  - **Cart**: routes use `yield* CartService` for authorized cart access — no duplicated ownership checks
  - **Rate limiting**: routes use `checkRateLimit()` from `@/lib/effect/rate-limit` — no copy-pasted in-memory maps
- **Validation**: routes use `parseBody(schema, req)` from `@/lib/effect/zod`, not manual `req.json()` + ad-hoc checks
- **Effect stays server-side**: no `effect` imports in client components (`src/components/`, `src/hooks/`, `src/contexts/`)
- **Type safety**: no `any`, no `as unknown as`, no `eslint-disable no-explicit-any`. Use `as` only at type boundaries (Payload `docs[0]`, Stripe API returns). Use type guards for runtime validation
- Server Components use the typed server API client (not raw `fetch` or direct Payload Local API)
- Client Components use the typed browser API client (not raw `fetch`)
- No `as never` or `as unknown as` casts that could be replaced by proper typing from generated API types
- Route schemas (`src/app/api/*/schema.ts`) match actual route handler behavior — request/response shapes, status codes, auth requirements
- i18n: no hardcoded strings (use the `t()` helper)
- RTL: logical CSS properties (`ms-`/`me-` not `ml-`/`mr-`)

## 4. Performance

- Unnecessary `"use client"` directives
- Images use Next.js `<Image>` component
- N+1 query patterns in API route handlers
- Proper `loading.tsx` and `error.tsx` boundaries

## 5. API Documentation

- `/api/openapi.json` — valid OpenAPI 3.1 spec with correct project name, description, and contact
- `/api/docs` — Scalar UI loads and renders all storefront endpoints
- `/llms.txt` — LLM-friendly plain text renders correctly
- `/to-humans.md` — Markdown reference renders correctly
- All custom routes have a matching schema file with a `RouteDoc` export
- Custom route docs are registered in the central route registry
- Admin-only endpoints don't appear in the public spec
- Read-only collections only expose GET methods in the public spec

## 6. Report

Organize findings by severity:

- **Critical** — Security vulnerabilities, data exposure risks, failing tests
- **Warning** — Code quality issues, potential bugs, stale types
- **Info** — Style improvements, optimization opportunities

If $ARGUMENTS specifies a focus area, prioritize that area but still run the automated checks.
