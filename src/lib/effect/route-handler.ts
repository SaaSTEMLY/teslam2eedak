import { Effect } from "effect";
import { NextResponse } from "next/server";

import type { HttpError } from "./errors";

// ── Response helpers ────────────────────────────────────────────────────────

export interface RouteSuccess<A> {
  readonly body: A;
  readonly status?: number;
}

/** Wrap a value as a 200 response. */
export const ok = <A>(body: A): RouteSuccess<A> => ({ body });

/** Wrap a value as a 201 response. */
export const created = <A>(body: A): RouteSuccess<A> => ({
  body,
  status: 201,
});

// ── Error → Response mapping ────────────────────────────────────────────────

function errorToResponse(error: HttpError): Response {
  switch (error._tag) {
    case "UnauthorizedError":
      return NextResponse.json(
        { error: error.message ?? "Unauthorized" },
        { status: 401 },
      );

    case "ForbiddenError":
      return NextResponse.json(
        { error: error.message ?? "Forbidden" },
        { status: 403 },
      );

    case "InvalidApiKeyError":
      return NextResponse.json({ error: error.reason }, { status: 401 });

    case "ValidationError":
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: 400 },
      );

    case "NotFoundError":
      return NextResponse.json(
        { error: `${error.resource} not found` },
        { status: 404 },
      );

    case "ConflictError":
      return NextResponse.json({ error: error.message }, { status: 409 });

    case "PaymentError":
      return NextResponse.json({ error: error.message }, { status: 402 });

    case "InvalidDiscountError":
      return NextResponse.json({ error: error.reason }, { status: 400 });

    case "ExternalServiceError":
      console.error(`${error.service}.${error.operation} failed:`, error.cause);
      return NextResponse.json(
        { error: "External service unavailable" },
        { status: 502 },
      );

    case "RateLimitedError":
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(error.retryAfterMs / 1000)),
          },
        },
      );

    case "PayloadOperationError":
      console.error("Payload operation failed:", error.message, error.cause);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
  }
}

// ── Route handler bridge ────────────────────────────────────────────────────

/**
 * Bridge between an Effect program and a Next.js route handler.
 *
 * - Maps success to a JSON response with the given status (default 200).
 * - Maps expected errors (HttpError union) to the appropriate HTTP status.
 * - Catches defects (unexpected thrown errors / bugs) as 500.
 *
 * Usage:
 * ```ts
 * export const GET = (req: Request) =>
 *   handleRoute(
 *     Effect.gen(function* () {
 *       // ... your logic ...
 *       return ok({ data: "hello" })
 *     }).pipe(Effect.provide(AppLive))
 *   )
 * ```
 */
export function handleRoute<A>(
  effect: Effect.Effect<RouteSuccess<A>, HttpError, never>,
): Promise<Response> {
  return effect.pipe(
    Effect.map(({ body, status }) =>
      NextResponse.json(body, { status: status ?? 200 }),
    ),
    Effect.catchAll((error) => Effect.succeed(errorToResponse(error))),
    Effect.catchAllDefect((defect) => {
      console.error("Unhandled defect in route handler:", defect);
      return Effect.succeed(
        NextResponse.json({ error: "Internal server error" }, { status: 500 }),
      );
    }),
    Effect.runPromise,
  );
}
