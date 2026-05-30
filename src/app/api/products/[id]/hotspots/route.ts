import { Effect } from "effect";

import {
  AppLive,
  Auth,
  Payload,
  NotFoundError,
  ValidationError,
  handleRoute,
  ok,
  parseBody,
} from "@/lib/effect";

import { updateHotspotsSchema } from "./schema";

/**
 * PATCH /api/products/:id/hotspots
 *
 * Replace the hotspot box list on a menu item. Admin-gated. Server-side
 * validation enforces the same min-size + in-bounds rules as the client
 * helper. Hotspots are stored as a json field on the product so a missing
 * authoring tool doesn't degrade the customer menu (per ADR-0002).
 */
export const PATCH = (
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      yield* auth.requireAdmin;

      const { id } = yield* Effect.tryPromise({
        try: () => ctx.params,
        catch: () =>
          new NotFoundError({ resource: "product", id: "missing-param" }),
      });
      const productId = /^\d+$/.test(id) ? Number(id) : id;

      const { hotspotBoxes } = yield* parseBody(updateHotspotsSchema, req);

      // Belt-and-braces: even though Zod enforces 0..1, also ensure each box
      // stays inside the image after adding x+w/y+h.
      for (const box of hotspotBoxes) {
        if (box.x + box.w > 1 + 1e-6 || box.y + box.h > 1 + 1e-6) {
          return yield* Effect.fail(
            new ValidationError({
              message: "Hotspot extends past image bounds",
              details: { box },
            }),
          );
        }
      }

      const db = yield* Payload;
      yield* db.update({
        collection: "products",
        id: productId,
        data: { hotspotBoxes },
      });

      return ok({
        productId,
        savedCount: hotspotBoxes.length,
      });
    }).pipe(Effect.provide(AppLive)),
  );
