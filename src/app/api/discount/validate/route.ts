import { Effect } from "effect";
import { headers } from "next/headers";

import { handleRoute, ok, AppLive, parseBody } from "@/lib/effect";
import { checkRateLimit } from "@/lib/effect/rate-limit";
import { Discount } from "@/lib/effect/services/discount";

import { ValidateDiscountRequestSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      // Rate limit by IP
      const headersList = yield* Effect.tryPromise(() => headers()).pipe(
        Effect.orDie,
      );
      const ip =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headersList.get("x-real-ip") ??
        "unknown";

      yield* checkRateLimit({ key: ip, maxRequests: 10, windowMs: 60_000 });

      const { code, customerEmail, subtotal } = yield* parseBody(
        ValidateDiscountRequestSchema,
        req,
      );

      const discount = yield* Discount;
      const result = yield* discount.validate({
        code,
        customerEmail,
        subtotal,
      });

      return ok({
        valid: true,
        ...result,
      });
    }).pipe(Effect.provide(AppLive)),
  );
