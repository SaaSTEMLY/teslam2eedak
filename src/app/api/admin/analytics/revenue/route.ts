import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Auth,
  AppLive,
  ExternalServiceError,
} from "@/lib/effect";
import { kvGet } from "@/lib/saasignal";

function kvNumber(entry: { value: unknown } | null): number {
  if (!entry) return 0;
  return typeof entry.value === "number" ? entry.value : 0;
}

export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const auth = yield* Auth;

      yield* auth.requireAdmin;

      const { searchParams } = new URL(req.url);
      const days = Math.min(Number(searchParams.get("days")) || 30, 365);

      const since = new Date();
      since.setDate(since.getDate() - days);

      const dates: string[] = [];
      const current = new Date(since);
      const today = new Date();

      while (current <= today) {
        dates.push(current.toISOString().split("T")[0] ?? "");
        current.setDate(current.getDate() + 1);
      }

      const kvResults = yield* Effect.tryPromise(() =>
        Promise.all(
          dates.map((date) => kvGet(`analytics:revenue:day:${date}`)),
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

      const data = dates.map((date, i) => ({
        date,
        revenue: kvNumber(kvResults[i] ?? null),
      }));

      return ok({ data });
    }).pipe(Effect.provide(AppLive)),
  );
