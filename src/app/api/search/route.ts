import { Effect } from "effect";

import {
  handleRoute,
  ok,
  Payload,
  AppLive,
  ExternalServiceError,
} from "@/lib/effect";
import { searchQuery } from "@/lib/saasignal";
import { resolveMedia } from "@/lib/utils";

const SEARCH_INDEX_ID = process.env.SAASIGNAL_SEARCH_INDEX || "products";

interface ProductHit {
  id: string;
  score: number;
  document: {
    name?: string;
    slug?: string;
    description?: string;
    priceInUSD?: number;
    category?: string;
    imageUrl?: string;
  };
}

interface BlogHit {
  id: string;
  title: string;
  slug: string;
  excerpt: string | undefined;
  category: string | undefined;
  coverImageUrl: string | undefined;
}

interface SearchResponse {
  hits?: ProductHit[];
  products: ProductHit[];
  blogs: BlogHit[];
}

export const GET = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const { searchParams } = new URL(req.url);
      const q = searchParams.get("q")?.trim();
      const limit = Math.min(Number(searchParams.get("limit")) || 10, 20);
      const locale = (searchParams.get("locale") || "en") as "en" | "ar" | "es";

      if (!q) {
        return ok<SearchResponse>({ hits: [], products: [], blogs: [] });
      }

      // Products via SaaSignal search
      const result = yield* Effect.tryPromise(() =>
        searchQuery(SEARCH_INDEX_ID, q, { limit }),
      ).pipe(
        Effect.mapError(
          () =>
            new ExternalServiceError({
              service: "SaaSignal",
              operation: "searchQuery",
            }),
        ),
      );
      const productHits: ProductHit[] = result.hits;

      // Blogs via Payload
      const db = yield* Payload;
      const { docs: blogDocs } = yield* db.find({
        collection: "blogs",
        locale,
        where: {
          and: [
            { status: { equals: "published" } },
            {
              or: [{ title: { contains: q } }, { excerpt: { contains: q } }],
            },
          ],
        },
        limit: Math.min(limit, 5),
        depth: 1,
      });

      const blogHits = blogDocs.map((doc) => {
        const d = doc as unknown as {
          id: string | number;
          title: string;
          slug: string;
          excerpt?: string;
          category?: string;
          coverImage?: unknown;
        };
        const img = resolveMedia(d.coverImage);
        return {
          id: String(d.id),
          title: d.title,
          slug: d.slug,
          excerpt: d.excerpt,
          category: d.category,
          coverImageUrl: img?.url,
        };
      });

      return ok<SearchResponse>({
        hits: productHits,
        products: productHits,
        blogs: blogHits,
      });
    }).pipe(Effect.provide(AppLive)),
  );
