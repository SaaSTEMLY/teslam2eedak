import { Effect } from "effect";

import {
  handleRoute,
  ok,
  created,
  Auth,
  Payload,
  AppLive,
  parseBody,
  ValidationError,
  ConflictError,
} from "@/lib/effect";
import { createReviewSchema } from "./schema";

const REVIEWS = "reviews" as const;

export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");
      const page = Number(searchParams.get("page")) || 1;
      const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
      const sort = searchParams.get("sort") || "-createdAt";

      if (!productId) {
        return yield* new ValidationError({
          message: "productId is required",
          details: {},
        });
      }

      const db = yield* Payload;

      const reviews = yield* db.find({
        collection: REVIEWS,
        where: {
          and: [
            { product: { equals: Number(productId) } },
            { status: { equals: "approved" } },
          ],
        },
        sort:
          sort === "helpful"
            ? "-helpfulCount"
            : sort === "highest"
              ? "-rating"
              : sort === "lowest"
                ? "rating"
                : "-createdAt",
        page,
        limit,
        depth: 1,
      });

      // Calculate aggregate stats
      let averageRating = 0;
      const breakdown: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      const allDocs = yield* db.find({
        collection: REVIEWS,
        where: {
          and: [
            { product: { equals: Number(productId) } },
            { status: { equals: "approved" } },
          ],
        },
        limit: 500,
        depth: 0,
      });

      if (allDocs.docs.length > 0) {
        let sum = 0;
        for (const doc of allDocs.docs) {
          const r = (doc as unknown as { rating: number }).rating;
          sum += r;
          const key = r as keyof typeof breakdown;
          breakdown[key] = (breakdown[key] ?? 0) + 1;
        }
        averageRating = Math.round((sum / allDocs.docs.length) * 10) / 10;
      }

      return ok({
        reviews: reviews.docs,
        totalPages: reviews.totalPages,
        page: reviews.page,
        totalDocs: reviews.totalDocs,
        averageRating,
        breakdown,
      });
    }).pipe(Effect.provide(AppLive)),
  );

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireUser;

      const {
        productId,
        rating,
        title,
        body: reviewBody,
      } = yield* parseBody(createReviewSchema, req);

      const db = yield* Payload;
      const payloadUser = yield* db.findUserByEmail(user.email);

      // Check if user already reviewed this product
      const existing = yield* db.find({
        collection: REVIEWS,
        where: {
          and: [
            { product: { equals: Number(productId) } },
            { customer: { equals: payloadUser.id } },
          ],
        },
        limit: 1,
      });

      if (existing.totalDocs > 0) {
        return yield* new ConflictError({
          message: "You have already reviewed this product",
        });
      }

      // Check if user has purchased this product (non-critical)
      let verifiedPurchase = false;
      const purchaseCheck = yield* Effect.either(
        db.find({
          collection: "orders",
          where: {
            or: [
              { customer: { equals: payloadUser.id } },
              { customerEmail: { equals: user.email } },
            ],
          },
          limit: 100,
          depth: 0,
        }),
      );

      if (purchaseCheck._tag === "Right") {
        verifiedPurchase = purchaseCheck.right.docs.some((order) => {
          const items = (order as unknown as { items?: { product?: number }[] })
            .items;
          return items?.some((item) => {
            const pid =
              typeof item.product === "number"
                ? item.product
                : (item.product as unknown as { id: number })?.id;
            return pid === Number(productId);
          });
        });
      }

      const review = yield* db.create({
        collection: REVIEWS,
        data: {
          product: Number(productId),
          customer: payloadUser.id,
          rating,
          title,
          body: reviewBody,
          status: "pending",
          verifiedPurchase,
          helpfulCount: 0,
        },
      });

      return created({ review });
    }).pipe(Effect.provide(AppLive)),
  );
