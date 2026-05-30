import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Auth,
  Payload,
  AppLive,
  ExternalServiceError,
} from "@/lib/effect";
import { kvGet } from "@/lib/saasignal";

function kvNumber(entry: { value: unknown } | null): number {
  if (!entry) return 0;
  return typeof entry.value === "number" ? entry.value : 0;
}

export const GET = () =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const db = yield* Payload;

      yield* auth.requireAdmin;

      // Fetch KV stats and customer count in parallel
      const [revenueResult, ordersResult] = yield* Effect.tryPromise(() =>
        Promise.all([
          kvGet("analytics:revenue:total"),
          kvGet("analytics:orders:total"),
        ]),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "kvGet",
            }),
        ),
      );

      const customersResult = yield* db.find({
        collection: "users",
        limit: 0,
      });

      const totalRevenue = kvNumber(revenueResult);
      const orderCount = kvNumber(ordersResult);
      const aov = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

      return ok({
        totalRevenue,
        orderCount,
        averageOrderValue: aov,
        customerCount: customersResult.totalDocs,
      });
    }).pipe(Effect.provide(AppLive)),
  );
