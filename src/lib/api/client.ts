import createClient from "openapi-fetch";
import type { paths, components, operations } from "./types";

export type { paths, components, operations };

// ── Response type helpers ────────────────────────────────────────────────────

/** Extract the JSON response body type for an operation's 200 response. */
type JsonResponse<Op> = Op extends {
  responses: {
    200: { content: { "application/json": infer R } };
  };
}
  ? R
  : never;

/** A single doc from a Payload list endpoint. */
type DocOf<Op> = JsonResponse<Op> extends { docs: (infer D)[] } ? D : never;

/** Product as returned by the API. */
export type ApiProduct = DocOf<operations["listProducts"]>;

/** Product variant as returned by the API. */
export type ApiVariant = DocOf<operations["listVariants"]>;

/** Blog post as returned by the API. */
export type ApiBlog = DocOf<operations["listBlogPosts"]>;

/** FAQ as returned by the API. */
export type ApiFaq = DocOf<operations["listFAQs"]>;

/** Media item as returned by the API. */
export type ApiMedia = DocOf<operations["listMedia"]>;

/** Single order as returned by the Payload API (via GET /api/orders/{id}). */
export type ApiOrder = JsonResponse<operations["findOrdersById"]>;

// ─── Query serializer ──────────────────────────────────────────────────────
// Payload's REST API uses `qs`-style bracket notation for nested `where`
// clauses (e.g. `where[and][0][status][equals]=published`).
// openapi-fetch's default serializer rejects deeply-nested objects,
// so we provide a custom one that flattens to bracket notation.
function flattenToEntries(obj: unknown, prefix = ""): [string, string][] {
  const entries: [string, string][] = [];
  if (obj === null || obj === undefined) return entries;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const key = prefix ? `${prefix}[${i}]` : `${i}`;
      entries.push(...flattenToEntries(item, key));
    });
  } else if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const key = prefix ? `${prefix}[${k}]` : k;
      entries.push(...flattenToEntries(v, key));
    }
  } else {
    entries.push([prefix, String(obj)]);
  }
  return entries;
}

function payloadQuerySerializer(params: Record<string, unknown>): string {
  return flattenToEntries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

// ─── Client factories ────────────────────────────────────────────────────────

const baseUrl =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

/**
 * Server-side API client — forwards cookies from the incoming request
 * so authenticated Payload endpoints work transparently.
 *
 * Usage in Server Components:
 * ```ts
 * const api = await createServerApiClient();
 * const { data } = await api.GET("/api/products");
 * ```
 */
export async function createServerApiClient() {
  const { headers: getHeaders } = await import("next/headers");
  const headersList = await getHeaders();

  return createClient<paths>({
    baseUrl,
    querySerializer: payloadQuerySerializer,
    headers: {
      cookie: headersList.get("cookie") || "",
    },
  });
}

/**
 * Browser-side API client — cookies are sent automatically by the browser.
 *
 * Usage in Client Components:
 * ```ts
 * const api = createBrowserApiClient();
 * const { data } = await api.POST("/api/contact", { body: { ... } });
 * ```
 */
export function createBrowserApiClient() {
  return createClient<paths>({
    baseUrl,
    querySerializer: payloadQuerySerializer,
    credentials: "include",
  });
}

/**
 * API key client — for third-party integrations using scoped API keys.
 *
 * Usage:
 * ```ts
 * const api = createApiKeyClient("sk_...");
 * const { data } = await api.GET("/api/products");
 * ```
 */
export function createApiKeyClient(apiKey: string) {
  return createClient<paths>({
    baseUrl,
    querySerializer: payloadQuerySerializer,
    headers: {
      "x-api-key": apiKey,
    },
  });
}
