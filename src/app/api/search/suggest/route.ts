import { Effect } from "effect";

import { handleRoute, ok, AppLive, ExternalServiceError } from "@/lib/effect";
import { searchSuggest } from "@/lib/saasignal";

const SEARCH_INDEX_ID = process.env.SAASIGNAL_SEARCH_INDEX || "products";

export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { searchParams } = new URL(req.url);
      const q = searchParams.get("q")?.trim();
      const limit = Math.min(Number(searchParams.get("limit")) || 5, 10);

      if (!q) {
        return ok({ suggestions: [] });
      }

      const result = yield* Effect.tryPromise(() =>
        searchSuggest(SEARCH_INDEX_ID, q, limit),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "searchSuggest",
            }),
        ),
      );

      return ok(result);
    }).pipe(Effect.provide(AppLive)),
  );
