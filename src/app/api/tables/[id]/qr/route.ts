import { Effect } from "effect";
import { NextResponse } from "next/server";

import { AppLive, Payload, NotFoundError } from "@/lib/effect";
import { buildTableMenuUrl, renderQrSvg } from "@/lib/ordering/qr";

/**
 * GET /api/tables/:id/qr
 *
 * Returns the table-paired menu QR as SVG. Anonymous (the URL it encodes
 * is itself public). The :id segment accepts either the numeric Payload
 * id or the unique short-id rendered on existing prints — the route looks
 * up both. Responds 404 when no matching table exists.
 *
 * Optional query params: `?w=320` (px), `?dark=%237a8f4f`, `?light=%23f2ead0`.
 */
export const GET = async (
  req: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> => {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const width = Number(url.searchParams.get("w") ?? "320");
  const dark = url.searchParams.get("dark") ?? undefined;
  const light = url.searchParams.get("light") ?? undefined;

  const program = Effect.gen(function* () {
    const db = yield* Payload;

    // Try numeric id first; fall back to shortId. Both are unique.
    const numericId = /^\d+$/.test(id) ? Number(id) : null;
    type TableDoc = {
      id: string | number;
      shortId?: string;
      label?: string;
      status?: string;
    };

    let doc: TableDoc | null = null;
    if (numericId !== null) {
      const found = yield* db
        .findByID({ collection: "tables", id: numericId })
        .pipe(Effect.either);
      if (found._tag === "Right") doc = found.right as TableDoc;
    }
    if (!doc) {
      const byShort = yield* db.find({
        collection: "tables",
        where: { shortId: { equals: id } },
        limit: 1,
      });
      const first = (byShort.docs as TableDoc[])[0];
      if (first) doc = first;
    }

    if (!doc || !doc.shortId) {
      return yield* Effect.fail(
        new NotFoundError({ resource: "table", id }),
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";
    const menuUrl = buildTableMenuUrl({
      baseUrl,
      tableShortId: doc.shortId,
    });

    const svg = yield* Effect.tryPromise({
      try: () =>
        renderQrSvg(menuUrl, {
          width: Number.isFinite(width) && width > 0 ? width : 320,
          darkColor: dark,
          lightColor: light,
        }),
      catch: (cause) =>
        new NotFoundError({ resource: "qr", id: String(cause) }),
    });

    return svg;
  }).pipe(Effect.provide(AppLive));

  return Effect.runPromise(
    program.pipe(
      Effect.match({
        onSuccess: (svg) =>
          new NextResponse(svg, {
            status: 200,
            headers: {
              "Content-Type": "image/svg+xml",
              "Cache-Control":
                "public, max-age=300, stale-while-revalidate=86400",
            },
          }),
        onFailure: (err) =>
          err._tag === "NotFoundError"
            ? NextResponse.json(
                { error: `${err.resource} not found`, id: err.id },
                { status: 404 },
              )
            : NextResponse.json(
                { error: "Internal error" },
                { status: 500 },
              ),
      }),
    ),
  );
};
