import { Effect } from "effect";
import { z } from "zod/v4";

import { handleRoute, ok, parseBody, Payload, AppLive } from "@/lib/effect";

const emailSchema = z.object({
  email: z.email(),
});

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { email } = yield* parseBody(emailSchema, req);
      const db = yield* Payload;
      const raw = yield* db.raw;

      const createResult = yield* Effect.either(
        Effect.tryPromise(() =>
          raw.create({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            collection: "newsletter-subscribers" as any,
            data: { email, subscribedAt: new Date().toISOString() },
          }),
        ),
      );
      if (createResult._tag === "Left") {
        // Duplicate email — ignore (unique constraint)
      }

      const resendApiKey = process.env.RESEND_API_KEY;
      const audienceId = process.env.RESEND_AUDIENCE_ID;
      if (resendApiKey && audienceId) {
        yield* Effect.either(
          Effect.tryPromise(() =>
            fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, unsubscribed: false }),
            }),
          ),
        );
      }

      return ok({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
