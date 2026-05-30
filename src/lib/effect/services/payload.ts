import { Context, Effect, Layer } from "effect";

import { getPayload as getPayloadInstance } from "@/lib/payload";
import { NotFoundError, PayloadOperationError } from "../errors";

// ── Types ───────────────────────────────────────────────────────────────────

type PayloadInstance = Awaited<ReturnType<typeof getPayloadInstance>>;

/** Payload operation args — an object with at least a `collection` field. */
type PayloadArgs = { collection: string; [key: string]: unknown };

export interface PayloadFindResult<T = unknown> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page?: number;
}

// ── Service definition ──────────────────────────────────────────────────────

export interface PayloadService {
  /** Wraps payload.find — fails with PayloadOperationError on database errors. */
  readonly find: (
    args: PayloadArgs,
  ) => Effect.Effect<PayloadFindResult, PayloadOperationError>;

  /** Wraps payload.findByID — fails with NotFoundError if the doc doesn't exist. */
  readonly findByID: (
    args: PayloadArgs & { id: string | number },
  ) => Effect.Effect<unknown, NotFoundError | PayloadOperationError>;

  /** Wraps payload.create. */
  readonly create: (
    args: PayloadArgs & { data: Record<string, unknown> },
  ) => Effect.Effect<unknown, PayloadOperationError>;

  /** Wraps payload.update. */
  readonly update: (
    args: PayloadArgs & { id?: string | number; data: Record<string, unknown> },
  ) => Effect.Effect<unknown, PayloadOperationError>;

  /** Wraps payload.delete. */
  readonly del: (
    args: PayloadArgs & {
      id?: string | number;
      where?: Record<string, unknown>;
    },
  ) => Effect.Effect<unknown, PayloadOperationError>;

  /**
   * Find a user by email. Fails with NotFoundError if not found.
   * Eliminates the repeated find-user-then-check-docs[0] pattern.
   */
  readonly findUserByEmail: (
    email: string,
  ) => Effect.Effect<
    { id: string | number; email: string },
    NotFoundError | PayloadOperationError
  >;

  /** Direct access to the raw Payload instance for advanced operations. */
  readonly raw: Effect.Effect<PayloadInstance>;
}

export class Payload extends Context.Tag("Payload")<
  Payload,
  PayloadService
>() {}

// ── Live implementation ─────────────────────────────────────────────────────

export const PayloadLive = Layer.effect(
  Payload,
  Effect.gen(function* () {
    const instance = yield* Effect.tryPromise({
      try: () => getPayloadInstance(),
      catch: (e) =>
        new PayloadOperationError({
          message: "Failed to initialize Payload",
          cause: e,
        }),
    });

    const wrapOp = <A>(
      op: () => Promise<A>,
      operationName?: string,
    ): Effect.Effect<A, PayloadOperationError> =>
      Effect.tryPromise({
        try: op,
        catch: (e) =>
          new PayloadOperationError({
            message:
              e instanceof Error
                ? e.message
                : `Payload ${operationName ?? "operation"} failed`,
            cause: e,
          }),
      });

    return Payload.of({
      find: (args) =>
        wrapOp(
          () =>
            instance.find(
              args as Parameters<PayloadInstance["find"]>[0],
            ) as Promise<PayloadFindResult>,
          "find",
        ),

      findByID: (args) =>
        wrapOp(
          () =>
            instance.findByID(
              args as Parameters<PayloadInstance["findByID"]>[0],
            ),
          "findByID",
        ).pipe(
          Effect.filterOrFail(
            (doc): doc is NonNullable<typeof doc> => doc != null,
            () =>
              new NotFoundError({
                resource: args.collection,
                id: String(args.id),
              }),
          ),
        ),

      create: (args) =>
        wrapOp(
          () =>
            instance.create(args as Parameters<PayloadInstance["create"]>[0]),
          "create",
        ),

      update: (args) =>
        wrapOp(
          () =>
            instance.update(args as Parameters<PayloadInstance["update"]>[0]),
          "update",
        ),

      del: (args) =>
        wrapOp(
          () =>
            instance.delete(args as Parameters<PayloadInstance["delete"]>[0]),
          "delete",
        ),

      findUserByEmail: (email: string) =>
        wrapOp(
          () =>
            instance.find({
              collection: "users",
              where: { email: { equals: email } },
              limit: 1,
            }),
          "findUserByEmail",
        ).pipe(
          Effect.flatMap((result) => {
            const user = result.docs[0];
            return user
              ? Effect.succeed(user as { id: string | number; email: string })
              : Effect.fail(
                  new NotFoundError({ resource: "users", id: email }),
                );
          }),
        ),

      raw: Effect.succeed(instance),
    });
  }),
);
