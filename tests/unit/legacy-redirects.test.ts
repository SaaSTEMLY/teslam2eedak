import { describe, test, expect } from "vitest";
import { LEGACY_REDIRECTS } from "@/lib/site/legacy-redirects";

const bySource = new Map(LEGACY_REDIRECTS.map((r) => [r.source, r] as const));

describe("LEGACY_REDIRECTS", () => {
  test("SaaS /products → KK /menu, permanent (308)", () => {
    const r = bySource.get("/products");
    expect(r).toBeDefined();
    expect(r?.destination).toBe("/menu");
    expect(r?.permanent).toBe(true);
  });

  test("/products/:slug* sub-paths also funnel to /menu", () => {
    const r = bySource.get("/products/:slug*");
    expect(r?.destination).toBe("/menu");
    expect(r?.permanent).toBe(true);
  });

  test("/checkout and /checkout/:rest* go to /menu", () => {
    expect(bySource.get("/checkout")?.destination).toBe("/menu");
    expect(bySource.get("/checkout/:rest*")?.destination).toBe("/menu");
  });

  test("/cart → /menu (drawer replaces the cart page in QR flow)", () => {
    const r = bySource.get("/cart");
    expect(r?.destination).toBe("/menu");
    expect(r?.permanent).toBe(true);
  });

  test("/license → /terms (no café meaning, route to legal)", () => {
    const r = bySource.get("/license");
    expect(r?.destination).toBe("/terms");
    expect(r?.permanent).toBe(true);
  });

  test("/wishlist → /account, NOT permanent (loyalty TBD)", () => {
    const r = bySource.get("/wishlist");
    expect(r?.destination).toBe("/account");
    expect(r?.permanent).toBe(false);
  });

  test("no destination points back at a deleted source (no redirect loops)", () => {
    const sources = new Set(LEGACY_REDIRECTS.map((r) => r.source));
    for (const r of LEGACY_REDIRECTS) {
      // Strip any :param suffixes from destination before comparing.
      const destBase = r.destination.split("/:")[0]!;
      expect(sources.has(destBase)).toBe(false);
    }
  });

  test("every destination is a top-level KK consumer route", () => {
    const allowed = new Set([
      "/menu",
      "/account",
      "/about",
      "/contact",
      "/blogs",
      "/faq",
      "/terms",
      "/privacy",
      "/orders",
      "/staff",
    ]);
    for (const r of LEGACY_REDIRECTS) {
      const top = `/${r.destination.split("/").filter(Boolean)[0]}`;
      expect(allowed.has(top)).toBe(true);
    }
  });
});
