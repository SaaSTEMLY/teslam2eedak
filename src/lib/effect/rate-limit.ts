import { Effect } from "effect";

import { RateLimitedError } from "./errors";

// ── Shared in-memory rate limit store ──────────────────────────────────────

const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Check whether the given key has exceeded its rate limit.
 * Succeeds (void) if under the limit, fails with `RateLimitedError` if over.
 *
 * Uses a single module-scoped Map — callers share the same store but can
 * configure per-route limits via `maxRequests` and `windowMs`.
 */
export function checkRateLimit(opts: {
  key: string;
  maxRequests: number;
  windowMs: number;
}): Effect.Effect<void, RateLimitedError> {
  return Effect.sync(() => {
    const now = Date.now();
    const entry = store.get(opts.key);

    if (!entry || now > entry.resetAt) {
      store.set(opts.key, { count: 1, resetAt: now + opts.windowMs });
      return false;
    }

    entry.count++;
    return entry.count > opts.maxRequests;
  }).pipe(
    Effect.flatMap((limited) =>
      limited
        ? Effect.fail(new RateLimitedError({ retryAfterMs: opts.windowMs }))
        : Effect.void,
    ),
  );
}
