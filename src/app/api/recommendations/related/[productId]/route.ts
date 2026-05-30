import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  ExternalServiceError,
} from "@/lib/effect";
import { rankingRelated } from "@/lib/saasignal";

const RANKING_COLLECTION_ID =
  process.env.SAASIGNAL_RANKING_COLLECTION || "products";

export const GET = (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const { productId } = yield* Effect.tryPromise(() => params).pipe(
        Effect.orDie,
      );
      const { searchParams } = new URL(req.url);
      const limit = Math.min(Number(searchParams.get("limit")) || 6, 12);
      const locale = searchParams.get("locale") || "en";

      const db = yield* Payload;

      const result = yield* Effect.tryPromise(() =>
        rankingRelated(RANKING_COLLECTION_ID, productId, limit),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "rankingRelated",
            }),
        ),
      );

      if (result.items.length > 0) {
        const productIds = result.items.map((item) => Number(item.id));

        const { docs } = yield* db.find({
          collection: "products",
          locale: locale as "en" | "ar" | "es",
          where: {
            id: { in: productIds },
            _status: { equals: "published" },
          },
          limit,
          depth: 1,
        });

        return ok({ products: docs });
      }

      // Fallback: same-category products
      const product = yield* db.findByID({
        collection: "products",
        id: Number(productId),
        depth: 0,
      });

      const category = (product as unknown as { category?: string })?.category;

      const { docs } = yield* db.find({
        collection: "products",
        locale: locale as "en" | "ar" | "es",
        where: {
          and: [
            { _status: { equals: "published" } },
            { id: { not_equals: Number(productId) } },
            ...(category ? [{ category: { equals: category } }] : []),
          ],
        },
        limit,
        depth: 1,
        sort: "-createdAt",
      });

      return ok({ products: docs });
    }).pipe(Effect.provide(AppLive)),
  );
