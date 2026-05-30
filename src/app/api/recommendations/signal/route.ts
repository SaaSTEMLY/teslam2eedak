import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Auth,
  AppLive,
  parseBody,
  ExternalServiceError,
} from "@/lib/effect";
import { rankingIngestSignals } from "@/lib/saasignal";
import { SignalRequestSchema } from "./schema";

const RANKING_COLLECTION_ID =
  process.env.SAASIGNAL_RANKING_COLLECTION || "products";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { productId, signal } = yield* parseBody(SignalRequestSchema, req);

      // Try to get user ID for personalized signals; fall back to anonymous
      const auth = yield* Auth;
      const userId = yield* auth.requireUser.pipe(
        Effect.map((u) => u.id),
        Effect.catchAll(() => Effect.succeed("anonymous")),
      );

      yield* Effect.tryPromise(() =>
        rankingIngestSignals(RANKING_COLLECTION_ID, [
          {
            userId,
            itemId: String(productId),
            signal,
            weight:
              signal === "purchase" ? 5 : signal === "add_to_cart" ? 3 : 1,
          },
        ]),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "rankingIngestSignals",
            }),
        ),
        // Don't fail the user action on ingestion errors
        Effect.catchAll(() => Effect.succeed(undefined)),
      );

      return ok({ ok: true });
    }).pipe(Effect.provide(AppLive)),
  );
