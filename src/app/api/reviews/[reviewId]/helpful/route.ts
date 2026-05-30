import { Effect } from "effect";

import { handleRoute, ok, Auth, Payload, AppLive } from "@/lib/effect";

const REVIEWS = "reviews" as const;

export const POST = (
  _req: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      yield* auth.requireUser;
      const db = yield* Payload;

      const { reviewId } = yield* Effect.promise(() => params);

      const review = yield* db.findByID({
        collection: REVIEWS,
        id: Number(reviewId),
        depth: 0,
      });

      const currentCount =
        (review as unknown as { helpfulCount?: number }).helpfulCount ?? 0;

      yield* db.update({
        collection: REVIEWS,
        id: Number(reviewId),
        data: {
          helpfulCount: currentCount + 1,
        },
      });

      return ok({ helpfulCount: currentCount + 1 });
    }).pipe(Effect.provide(AppLive)),
  );
