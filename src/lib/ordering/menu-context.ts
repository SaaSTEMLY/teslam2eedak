/**
 * Resolve `/menu?t=...&mode=...&l=...` query into a structured menu context.
 *
 * Possible inbound shapes:
 *   - Table QR:   `?t=X7K2P9`                    → dine-in
 *   - Pickup QR:  `?mode=pickup&l=maadi`         → click & collect at branch
 *   - Generic:    `?mode=pickup`                 → click & collect, no branch yet
 *   - Bare:       `/menu`                        → default fulfillment mode
 *
 * Pure resolver that doesn't touch the database — it only decides what
 * lookups the server component needs to perform.
 */

import { isFulfillmentMode, type FulfillmentMode } from "./fulfillment";

export type MenuContextLookup =
  | { kind: "table"; tableShortId: string }
  | { kind: "pickup"; locationSlug: string | null }
  | { kind: "default"; mode: FulfillmentMode };

export interface MenuContextInput {
  readonly searchParams: Record<string, string | string[] | undefined>;
  /** Fallback mode when the URL carries nothing. */
  readonly defaultMode?: FulfillmentMode;
}

function firstOf(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  if (typeof value === "string") return value;
  return null;
}

export function resolveMenuContext(input: MenuContextInput): MenuContextLookup {
  const t = firstOf(input.searchParams.t);
  if (t && t.trim().length > 0) {
    return { kind: "table", tableShortId: t.trim() };
  }

  const mode = firstOf(input.searchParams.mode);
  if (mode === "pickup") {
    const slug = firstOf(input.searchParams.l);
    return {
      kind: "pickup",
      locationSlug: slug && slug.trim().length > 0 ? slug.trim() : null,
    };
  }

  const explicit = isFulfillmentMode(mode) ? mode : null;
  return { kind: "default", mode: explicit ?? input.defaultMode ?? "pickup" };
}
