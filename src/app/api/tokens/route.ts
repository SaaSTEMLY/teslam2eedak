import { Effect } from "effect";
import { headers } from "next/headers";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  UnauthorizedError,
  ForbiddenError,
  ExternalServiceError,
  InvalidApiKeyError,
} from "@/lib/effect";
import { getApiKeyDetails } from "@/lib/api-key/auth";
import { parseApiKeyMetadata } from "@/lib/api-key/metadata";
import { permissionsToScopes } from "@/lib/api-key/scopes";

/**
 * GET /api/tokens
 *
 * List child tokens created by the requesting API key.
 * Requires the `tokens:read` scope.
 */
export const GET = () =>
  handleRoute(
    Effect.gen(function* () {
      const headersList = yield* Effect.tryPromise(() => headers()).pipe(
        Effect.orDie,
      );
      const apiKeyHeader = headersList.get("x-api-key");

      if (!apiKeyHeader) {
        return yield* new UnauthorizedError({
          message: "API key required. Pass x-api-key header.",
        });
      }

      const parentKey = yield* Effect.tryPromise(() =>
        getApiKeyDetails(apiKeyHeader),
      ).pipe(
        Effect.orDie,
        Effect.flatMap((key) =>
          key
            ? Effect.succeed(key)
            : Effect.fail(
                new InvalidApiKeyError({
                  reason: "Invalid or expired API key.",
                }),
              ),
        ),
      );

      if (!parentKey.scopes.includes("tokens:read")) {
        return yield* new ForbiddenError({
          message: "This API key does not have the tokens:read scope.",
        });
      }

      const raw = yield* (yield* Payload).raw;

      const allKeys = yield* Effect.tryPromise(() =>
        raw.betterAuth.api.listApiKeys({ headers: headersList }),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "BetterAuth",
              operation: "listApiKeys",
            }),
        ),
      );

      if (!Array.isArray(allKeys)) {
        return ok({ tokens: [] });
      }

      const childTokens = allKeys
        .filter((key: Record<string, unknown>) => {
          const meta = parseApiKeyMetadata(key.metadata);
          return meta?.parentKeyId === parentKey.id;
        })
        .map((key: Record<string, unknown>) => ({
          id: key.id,
          name: key.name,
          start: key.start,
          prefix: key.prefix,
          enabled: key.enabled,
          expiresAt: key.expiresAt,
          createdAt: key.createdAt,
          scopes: permissionsToScopes(
            key.permissions as Record<string, string[]> | null,
          ),
        }));

      return ok({ tokens: childTokens });
    }).pipe(Effect.provide(AppLive)),
  );
