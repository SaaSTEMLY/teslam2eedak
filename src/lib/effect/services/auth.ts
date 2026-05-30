import { Context, Effect, Layer } from "effect";
import { headers } from "next/headers";

import {
  ForbiddenError,
  InvalidApiKeyError,
  PayloadOperationError,
  UnauthorizedError,
} from "../errors";
import { Payload } from "./payload";

// ── Types ───────────────────────────────────────────────────────────────────

export interface SessionUser {
  readonly id: string;
  readonly email: string;
  readonly name?: string | null;
  readonly image?: string | null;
}

export interface AdminUser extends SessionUser {
  readonly payloadUserId: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Type guard to validate a session user has the required shape. */
function isSessionUser(user: unknown): user is {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
} {
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    typeof (user as Record<string, unknown>).id === "string" &&
    "email" in user &&
    typeof (user as Record<string, unknown>).email === "string"
  );
}

/** Check if a role field (string or string[]) includes a given role. */
function hasRole(role: string | string[] | undefined, target: string): boolean {
  return Array.isArray(role) ? role.includes(target) : role === target;
}

// ── Service definition ──────────────────────────────────────────────────────

export interface AuthService {
  /**
   * Get the current session user or fail with `UnauthorizedError`.
   * Works for both cookie-based sessions and API key auth.
   */
  readonly requireUser: Effect.Effect<SessionUser, UnauthorizedError>;

  /**
   * Require an authenticated user and verify the request has the given
   * API key scopes. Cookie-based sessions bypass scope checks (full access).
   * Fails with `ForbiddenError` if scopes are insufficient.
   */
  readonly requireScopes: (
    scopes: string[],
  ) => Effect.Effect<SessionUser, UnauthorizedError | ForbiddenError>;

  /**
   * Require an authenticated user with the "admin" role.
   * Fails with `UnauthorizedError` if no session, `ForbiddenError` if not admin.
   */
  readonly requireAdmin: Effect.Effect<
    AdminUser,
    UnauthorizedError | ForbiddenError | PayloadOperationError
  >;

  /**
   * Verify an API key and return its details.
   * Fails with `InvalidApiKeyError` if the key is invalid.
   */
  readonly verifyApiKey: (
    key: string,
  ) => Effect.Effect<
    { id: string; userId: string; permissions: Record<string, string[]> },
    InvalidApiKeyError
  >;
}

export class Auth extends Context.Tag("Auth")<Auth, AuthService>() {}

// ── Live implementation ─────────────────────────────────────────────────────

export const AuthLive = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const db = yield* Payload;
    const raw = yield* db.raw;

    // Session retrieval failure is a defect — the domain error is "no session"
    const getSession = Effect.tryPromise(() => headers()).pipe(
      Effect.flatMap((headersList) =>
        Effect.tryPromise(() =>
          raw.betterAuth.api.getSession({ headers: headersList }),
        ),
      ),
      Effect.orDie,
    );

    const requireUser: AuthService["requireUser"] = Effect.gen(function* () {
      const session = yield* getSession;
      if (!session?.user || !isSessionUser(session.user)) {
        return yield* new UnauthorizedError({});
      }
      return session.user;
    });

    return Auth.of({
      requireUser,

      requireScopes: (scopes: string[]) =>
        Effect.gen(function* () {
          const session = yield* getSession;
          if (!session?.user || !isSessionUser(session.user)) {
            return yield* new UnauthorizedError({});
          }

          const headersList = yield* Effect.tryPromise(() => headers()).pipe(
            Effect.orDie,
          );
          const apiKeyHeader = headersList.get("x-api-key");

          if (apiKeyHeader && scopes.length > 0) {
            const { scopesToPermissions } = yield* Effect.tryPromise(
              () => import("@/lib/api-key/scopes"),
            ).pipe(Effect.orDie);
            const permissions = scopesToPermissions(
              scopes as Parameters<typeof scopesToPermissions>[0],
            );
            const result = yield* Effect.tryPromise(() =>
              raw.betterAuth.api.verifyApiKey({
                body: { key: apiKeyHeader, permissions },
              }),
            ).pipe(Effect.orDie);
            if (!result?.valid) {
              return yield* new ForbiddenError({
                message: "Insufficient API key scopes",
              });
            }
          }

          return session.user;
        }),

      requireAdmin: Effect.gen(function* () {
        const user = yield* requireUser;

        const users = yield* db.find({
          collection: "users",
          where: { email: { equals: user.email } },
          limit: 1,
        });

        const payloadUser = users.docs[0] as
          | { id: number; role?: string | string[] }
          | undefined;

        if (!payloadUser || !hasRole(payloadUser.role, "admin")) {
          return yield* new ForbiddenError({});
        }

        return { ...user, payloadUserId: payloadUser.id };
      }),

      verifyApiKey: (key: string) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: () => raw.betterAuth.api.verifyApiKey({ body: { key } }),
            catch: () =>
              new InvalidApiKeyError({ reason: "API key verification failed" }),
          });
          if (!result?.valid || !result.key) {
            return yield* new InvalidApiKeyError({
              reason: "Invalid or expired API key",
            });
          }
          const rawPermissions = result.key.permissions;
          return {
            id: result.key.id,
            userId: result.key.userId,
            permissions:
              typeof rawPermissions === "object" && rawPermissions !== null
                ? (rawPermissions as Record<string, string[]>)
                : {},
          };
        }),
    });
  }),
);
