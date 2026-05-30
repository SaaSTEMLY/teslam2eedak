import { Effect } from "effect";
import type { ZodType } from "zod/v4";
import { ZodError } from "zod/v4";

import { ValidationError } from "./errors";

/**
 * Parse unknown input with a Zod schema, returning an Effect.
 * Fails with `ValidationError` (maps to 400) on parse failure.
 */
export function parseZod<T>(
  schema: ZodType<T>,
  input: unknown,
): Effect.Effect<T, ValidationError> {
  return Effect.try({
    try: () => schema.parse(input),
    catch: (e) =>
      new ValidationError({
        message: "Validation failed",
        details: e instanceof ZodError ? e.flatten() : String(e),
      }),
  });
}

/**
 * Parse a Request body as JSON, then validate with a Zod schema.
 * Handles both JSON parse errors and schema validation errors.
 */
export function parseBody<T>(
  schema: ZodType<T>,
  request: Request,
): Effect.Effect<T, ValidationError> {
  return Effect.gen(function* () {
    const body = yield* Effect.tryPromise({
      try: () => request.json(),
      catch: () =>
        new ValidationError({ message: "Invalid JSON body", details: {} }),
    });
    return yield* parseZod(schema, body);
  });
}
