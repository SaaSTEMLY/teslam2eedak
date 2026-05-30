import { Effect } from "effect";
import { NextResponse } from "next/server";

import { AppLive, Payload, NotFoundError } from "@/lib/effect";
import { buildPickupMenuUrl, renderQrSvg } from "@/lib/ordering/qr";

/**
 * GET /api/locations/:id/qr-pickup
 *
 * Returns the pickup (click & collect) QR for a branch. Anonymous. Accepts
 * the location's numeric id or slug. The QR resolves to
 * `/menu?mode=pickup&l=<slug>`, landing the guest in click-and-collect.
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
    const numericId = /^\d+$/.test(id) ? Number(id) : null;
    type LocationDoc = {
      id: string | number;
      slug?: string;
      status?: string;
    };

    let doc: LocationDoc | null = null;
    if (numericId !== null) {
      const found = yield* db
        .findByID({ collection: "locations", id: numericId })
        .pipe(Effect.either);
      if (found._tag === "Right") doc = found.right as LocationDoc;
    }
    if (!doc) {
      const bySlug = yield* db.find({
        collection: "locations",
        where: { slug: { equals: id } },
        limit: 1,
      });
      const first = (bySlug.docs as LocationDoc[])[0];
      if (first) doc = first;
    }

    if (!doc) {
      return yield* Effect.fail(
        new NotFoundError({ resource: "location", id }),
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000";
    const menuUrl = buildPickupMenuUrl({
      baseUrl,
      locationSlug: doc.slug,
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
