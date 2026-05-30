---
name: test
description: "Run integration tests with proper local service setup — dev server, Stripe listener, and test execution."
---

# Test

Run the project's integration tests locally with all required services. $ARGUMENTS can specify a specific test file or pattern.

## Prerequisites

Integration tests require two background services:

1. **Dev server** (`bun dev`) on `http://localhost:3000`
2. **Stripe listener** (`bun dev:env`) forwarding webhooks to the dev server

You can start both with `bun dev:all`, or individually.

## Steps

### 1. Check Services

Verify both services are running:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --max-time 5
```

If the server is not responding (status `000` or timeout):

- Start it with `bun dev` (background) and wait for a `200` response
- If Stripe tests are needed, also ensure `bun dev:env` is running

### 2. Run Tests

Run all tests or a specific file/pattern:

From Windows Command Prompt or PowerShell, use WSL to avoid symlink issues:

```bash
# All tests (run via WSL to avoid corrupted bin links on Windows)
wsl -e bash -ic 'cd ~/apps/saastarter && bun run test'

# Specific file
wsl -e bash -ic 'cd ~/apps/saastarter && bun run test tests/routes/contact.test.ts'

# Pattern match
wsl -e bash -ic 'cd ~/apps/saastarter && bun run test --grep "newsletter"'
```

> **Why WSL?** On Windows, `bun run` resolves bin metadata through the `\\wsl.localhost` UNC path, which can corrupt symlinks. Running inside WSL uses native Linux paths and avoids this.

From WSL or Unix-based systems, run directly:

```bash
# All tests
bun run test

# Specific file
bun run test tests/routes/contact.test.ts

# Pattern match
bun run test --grep "newsletter"
```

### 3. Troubleshooting

| Symptom                           | Cause                                         | Fix                                                                     |
| --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| `Failed to authenticate`          | Test user doesn't exist or email not verified | Check `/api/test/setup` route is accessible (dev-only endpoint)         |
| Timeouts on all tests             | Dev server not running                        | Start `bun dev` and wait for ready                                      |
| Stripe/payment test failures      | Stripe listener not running                   | Start `bun dev:env` or `bun stripe:listen`                              |
| `SQLITE_UNKNOWN` errors           | Remote DB schema out of sync                  | Run Payload migrations or check `payload_locked_documents_rels` columns |
| Tests pass locally but fail in CI | CI needs the dev server started first         | The GitHub workflow handles this automatically                          |
| `📧 [LOCAL EMAIL]` in console     | Normal — emails log to console in dev/test    | Not an error. Real emails only sent in production via Resend.           |

### 4. Writing New Tests

Tests live in `tests/routes/` and use the helpers from `tests/helpers/setup.ts`:

- `api` — unauthenticated `openapi-fetch` client (typed from OpenAPI spec)
- `createAuthenticatedClient()` — signs up, verifies, signs in, returns authenticated client
- `rawPost/rawGet/rawPatch/rawDelete` — raw fetch helpers with proper headers
- `testSetup(action, data)` — calls `/api/test/setup` for seeding/cleanup (dev-only)
- `cleanupByField/cleanupById` — delete test data after tests

**Pattern:** Each test file should clean up after itself using `afterAll` or `afterEach`.

## Output

Report results:

```
Tests: N passed / N failed / N skipped (N total)
Duration: Xs
```

If tests fail, show the failing test names, error messages, and suggest fixes. For a full CI check including types and lint, run `/ci`.
