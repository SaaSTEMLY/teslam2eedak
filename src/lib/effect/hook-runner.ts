import { Effect } from "effect";

/**
 * Run an Effect inside a Payload hook (fire-and-forget).
 *
 * Hooks must never block the main collection operation, so this runner:
 * 1. Logs defects (unexpected errors) via the Payload logger.
 * 2. Catches all defects to prevent the hook from throwing.
 * 3. Has a final `.catch()` safety net so the Promise never rejects.
 *
 * Usage in payload.config.ts:
 * ```ts
 * afterChange: [
 *   ({ doc, req }) => {
 *     runHookEffect(
 *       "sendOrderEmail",
 *       Effect.gen(function* () {
 *         // ... send email logic ...
 *       }),
 *       (msg, err) => req.payload.logger.error({ msg, err }),
 *     )
 *     return doc
 *   },
 * ]
 * ```
 */
export function runHookEffect(
  name: string,
  effect: Effect.Effect<void, never, never>,
  logger: (msg: string, err?: unknown) => void,
): void {
  Effect.runPromise(
    effect.pipe(
      Effect.tapDefect((defect) =>
        Effect.sync(() => logger(`Hook "${name}" defect`, defect)),
      ),
      Effect.catchAllDefect(() => Effect.void),
    ),
  ).catch((err) => {
    logger(`Hook "${name}" runner failed`, err);
  });
}
