import { Effect } from "effect";
import { headers } from "next/headers";
import { z } from "zod";

import {
  handleRoute,
  ok,
  Auth,
  Payload,
  AppLive,
  parseBody,
  PayloadOperationError,
} from "@/lib/effect";
import { parseApiKeyMetadata } from "@/lib/api-key/metadata";

const revokeSchema = z.object({
  keyId: z.string().min(1),
});

/**
 * POST /api/tokens/revoke
 *
 * Revoke an API key and cascade-delete all descendant tokens.
 * Authenticated via session cookie (UI) or API key with tokens:write.
 */
export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      yield* auth.requireUser;

      const { keyId } = yield* parseBody(revokeSchema, req);

      const raw = yield* (yield* Payload).raw;
      const headersList = yield* Effect.tryPromise(() => headers()).pipe(
        Effect.orDie,
      );

      // List all user's keys to build the descendant tree
      const allKeys = yield* Effect.tryPromise(() =>
        raw.betterAuth.api.listApiKeys({ headers: headersList }),
      ).pipe(
        Effect.mapError(
          () =>
            new PayloadOperationError({
              message: "Failed to list keys.",
            }),
        ),
      );

      if (!Array.isArray(allKeys)) {
        return yield* new PayloadOperationError({
          message: "Failed to list keys.",
        });
      }

      // Build parent->children map from metadata
      const childrenMap = new Map<string, string[]>();
      for (const key of allKeys) {
        const meta = parseApiKeyMetadata(
          (key as Record<string, unknown>).metadata,
        );
        if (meta?.parentKeyId) {
          const siblings = childrenMap.get(meta.parentKeyId) ?? [];
          siblings.push((key as Record<string, unknown>).id as string);
          childrenMap.set(meta.parentKeyId, siblings);
        }
      }

      // BFS to collect all descendant IDs
      const toRevoke: string[] = [];
      const queue = [keyId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        toRevoke.push(current);
        const children = childrenMap.get(current) ?? [];
        queue.push(...children);
      }

      // Delete all collected keys (children first, then target)
      let revoked = 0;
      for (const id of toRevoke.reverse()) {
        const deleteResult = yield* Effect.tryPromise(() =>
          raw.betterAuth.api.deleteApiKey({
            body: { keyId: id },
            headers: headersList,
          }),
        ).pipe(Effect.either);

        if (deleteResult._tag === "Right") {
          revoked++;
        }
        // Key may already be deleted; continue
      }

      return ok({ revoked });
    }).pipe(Effect.provide(AppLive)),
  );
