import { Effect } from "effect";
import { headers } from "next/headers";
import { z } from "zod";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  parseBody,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  ExternalServiceError,
  InvalidApiKeyError,
} from "@/lib/effect";
import { getApiKeyDetails } from "@/lib/api-key/auth";
import {
  type ApiScope,
  API_SCOPES,
  scopesToPermissions,
} from "@/lib/api-key/scopes";

const createSubTokenSchema = z.object({
  name: z.string().min(1).max(32),
  scopes: z.array(z.string()).min(1),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

/**
 * POST /api/tokens/create
 *
 * Create a child token scoped to a subset of the parent token's permissions.
 * Requires the parent token to have `tokens:write` scope.
 */
export const POST = (req: Request) =>
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

      // Verify parent key and get its details
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

      // Check parent has tokens:write scope
      if (!parentKey.scopes.includes("tokens:write")) {
        return yield* new ForbiddenError({
          message: "This API key does not have the tokens:write scope.",
        });
      }

      // Parse and validate request body
      const {
        name,
        scopes: requestedScopes,
        expiresInDays,
      } = yield* parseBody(createSubTokenSchema, req);

      // Validate all requested scopes are real scopes
      const invalidScopes = requestedScopes.filter((s) => !(s in API_SCOPES));
      if (invalidScopes.length > 0) {
        return yield* new ValidationError({
          message: "Unknown scopes.",
          details: { invalidScopes },
        });
      }

      // Validate requested scopes are a subset of parent's scopes
      const parentScopeSet = new Set(parentKey.scopes);
      const disallowedScopes = requestedScopes.filter(
        (s) => !parentScopeSet.has(s as ApiScope),
      );
      if (disallowedScopes.length > 0) {
        return yield* new ForbiddenError({
          message: "Requested scopes exceed parent key permissions.",
        });
      }

      const validatedScopes = requestedScopes as ApiScope[];
      const permissions = scopesToPermissions(validatedScopes);

      // Create child key via Better-Auth server API
      const raw = yield* (yield* Payload).raw;
      const result = yield* Effect.tryPromise(() =>
        raw.betterAuth.api.createApiKey({
          body: {
            name,
            prefix: "sk_",
            userId: parentKey.userId,
            permissions,
            metadata: {
              parentKeyId: parentKey.id,
              parentKeyName: parentKey.name ?? "Unnamed",
              createdVia: "delegation" as const,
            },
            ...(expiresInDays ? { expiresIn: expiresInDays * 86400 } : {}),
          },
        }),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "BetterAuth",
              operation: "createApiKey",
            }),
        ),
      );

      if (!result?.key) {
        return yield* new ExternalServiceError({
          service: "BetterAuth",
          operation: "createApiKey",
        });
      }

      return ok({
        id: result.id,
        key: result.key,
        name,
        scopes: validatedScopes,
      });
    }).pipe(Effect.provide(AppLive)),
  );
