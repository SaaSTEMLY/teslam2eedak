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

      // Fetch all published products
      const { docs } = yield* db.find({
        collection: "products",
        limit: 100,
        depth: 0,
        where: { _status: { equals: "published" } },
      });

      // Fetch KV stats for each product in parallel
      const statsResults = yield* Effect.tryPromise(() =>
        Promise.all(
          docs.map(async (doc) => {
            const product = doc as { id: number; name?: string };
            const [revenueResult, quantityResult] = await Promise.all([
              kvGet(`analytics:product:${product.id}:revenue`),
              kvGet(`analytics:product:${product.id}:quantity`),
            ]);

            return {
              id: product.id,
              name: product.name ?? `Product #${product.id}`,
              revenue: kvNumber(revenueResult),
              quantity: kvNumber(quantityResult),
            };
          }),
        ),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "kvGet",
            }),
        ),
      );

      const topProducts = statsResults
        .filter((p) => p.revenue > 0 || p.quantity > 0)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return ok({ products: topProducts });
    }).pipe(Effect.provide(AppLive)),
  );
