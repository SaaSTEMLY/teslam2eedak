import { Effect } from "effect";

import {
  handleRoute,
  created,
  Payload,
  AppLive,
  parseBody,
} from "@/lib/effect";
import { contactFormSchema } from "./schema";

export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { name, email, subject, message } = yield* parseBody(
        contactFormSchema,
        req,
      );

      const db = yield* Payload;
      yield* db.create({
        collection: "contact-form-submissions",
        data: {
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        },
      });

      return created({ success: true });
    }).pipe(Effect.provide(AppLive)),
  );
