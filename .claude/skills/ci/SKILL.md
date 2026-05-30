---
name: ci
description: "Run type check, lint, and integration tests — use after implementing features or before pushing."
---

# CI

Run the project's CI gate locally. This is the same check that runs in GitHub Actions on push.

## Steps

Run these sequentially — stop on first failure:

### 1. Type Check

```bash
bunx tsc --noEmit
```

If this fails, fix all TypeScript errors before continuing.

### 2. Lint

```bash
bun run --bun node_modules/eslint/bin/eslint.js
```

If this fails, fix all ESLint errors and warnings — both are treated as errors in this project.

### 3. Integration Tests

Requires `bun dev` and `bun dev:env` (Stripe listener) running. If not running, start them first and wait for the server to be ready. See `/test` for detailed setup and troubleshooting.

> **WSL note:** On Windows, `bun run test` may fail due to corrupted bin symlinks across the `\\wsl.localhost` UNC path. Run tests inside WSL:

```bash
wsl -e bash -ic 'cd ~/apps/saastarter && bun run test'
```

If tests fail, report which tests failed and why. Do NOT skip failing tests — fix the root cause. Run `/test` for more detailed diagnostics if needed.

## Output

Summarize results as a table:

| Check      | Result                              |
| ---------- | ----------------------------------- |
| Type Check | ✅ / ❌ (N errors)                  |
| Lint       | ✅ / ❌ (N errors, N warnings)      |
| Tests      | ✅ N passed / ❌ N failed, N passed |

If all pass, confirm the code is ready to push. If any fail, list the failures and offer to fix them.

For a deeper audit covering security, API docs, scopes, and code patterns, run `/quality-review`.
