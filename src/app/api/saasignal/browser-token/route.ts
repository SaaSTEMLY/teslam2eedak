import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Auth,
  AppLive,
  ExternalServiceError,
} from "@/lib/effect";
import { createBrowserToken } from "@/lib/saasignal";

export const POST = () =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;
      yield* auth.requireUser;

      const result = yield* Effect.tryPromise(() =>
        createBrowserToken(["channels:subscribe"]),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "createBrowserToken",
            }),
        ),
      );

      return ok({ token: result.token });
    }).pipe(Effect.provide(AppLive)),
  );
