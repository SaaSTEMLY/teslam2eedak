import { Effect } from "effect";

import { handleRoute, ok, Auth, Payload, AppLive } from "@/lib/effect";

export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      const user = yield* auth.requireUser;

      const db = yield* Payload;
      const payloadUser = yield* db.findUserByEmail(user.email);

      const { searchParams } = new URL(req.url);
      const page = Number(searchParams.get("page")) || 1;
      const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

      const orders = yield* db.find({
        collection: "orders",
        where: {
          or: [
            { customer: { equals: payloadUser.id } },
            { customerEmail: { equals: user.email } },
          ],
        },
        sort: "-createdAt",
        page,
        limit,
        depth: 2,
      });

      return ok({
        orders: orders.docs,
        totalPages: orders.totalPages,
        page: orders.page,
        totalDocs: orders.totalDocs,
      });
    }).pipe(Effect.provide(AppLive)),
  );
