import { describe, test, expect } from "vitest";

import { locationSeed, tableSeeds } from "@/endpoints/seed/locations";
import { modifierGroupSeeds } from "@/endpoints/seed/modifier-groups";
import { menuItemSeeds } from "@/endpoints/seed/menu-items";

describe("locationSeed", () => {
  test("has all required restaurant fields", () => {
    expect(locationSeed.slug).toMatch(/^[a-z0-9-]+$/);
    expect(locationSeed.vatPercent).toBeGreaterThan(0);
    expect(locationSeed.serviceChargePercent).toBeGreaterThanOrEqual(0);
    expect(locationSeed.allowedPaymentProviders.length).toBeGreaterThan(0);
  });

  test("covers all 7 days in hours", () => {
    const days = new Set(locationSeed.hours.map((h) => h.day));
    expect(days.size).toBe(7);
  });

  test("opening hours use HH:MM and open < close on every day", () => {
    for (const block of locationSeed.hours) {
      expect(block.openTime).toMatch(/^\d{2}:\d{2}$/);
      expect(block.closeTime).toMatch(/^\d{2}:\d{2}$/);
      expect(block.openTime < block.closeTime).toBe(true);
    }
  });
});

describe("tableSeeds", () => {
  test("every table has a unique shortId", () => {
    const ids = tableSeeds.map((t) => t.shortId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("shortIds are 6-char uppercase alphanumeric", () => {
    for (const t of tableSeeds) {
      expect(t.shortId).toMatch(/^[A-Z0-9]{6}$/);
    }
  });

  test("every table has a non-empty label and a known status", () => {
    for (const t of tableSeeds) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(["active", "inactive"]).toContain(t.status);
    }
  });
});

describe("modifierGroupSeeds", () => {
  test("every group has a unique slug", () => {
    const slugs = modifierGroupSeeds.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("min/max selectable form a sensible window for each group", () => {
    for (const g of modifierGroupSeeds) {
      expect(g.minSelectable).toBeGreaterThanOrEqual(0);
      expect(g.maxSelectable).toBeGreaterThanOrEqual(g.minSelectable);
      expect(g.maxSelectable).toBeGreaterThanOrEqual(1);
    }
  });

  test("every option has a unique value and a price delta", () => {
    for (const g of modifierGroupSeeds) {
      const values = g.options.map((o) => o.value);
      expect(new Set(values).size).toBe(values.length);
      for (const o of g.options) {
        expect(o.value).toMatch(/^[a-z0-9-]+$/);
        expect(o.priceDelta).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test("at most one isDefault option per pick-one group", () => {
    for (const g of modifierGroupSeeds.filter((g) => g.maxSelectable === 1)) {
      const defaults = g.options.filter((o) => o.isDefault === true);
      expect(defaults.length).toBeLessThanOrEqual(1);
    }
  });

  test("milk options carry the appropriate dietary tags", () => {
    const milk = modifierGroupSeeds.find((g) => g.slug === "milk-choice")!;
    const oat = milk.options.find((o) => o.value === "oat")!;
    expect(oat.allergens).toContain("vegan");
    expect(oat.allergens).toContain("dairy-free");
  });
});

describe("menuItemSeeds", () => {
  test("every item has a unique slug", () => {
    const slugs = menuItemSeeds.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("every item is en/ar localized", () => {
    for (const item of menuItemSeeds) {
      expect(item.name.en.length).toBeGreaterThan(0);
      expect(item.name.ar.length).toBeGreaterThan(0);
      expect(item.description.en.length).toBeGreaterThan(0);
      expect(item.description.ar.length).toBeGreaterThan(0);
      expect(item.menuSection.en.length).toBeGreaterThan(0);
      expect(item.menuSection.ar.length).toBeGreaterThan(0);
    }
  });

  test("base price is positive integer qirsh", () => {
    for (const item of menuItemSeeds) {
      expect(Number.isInteger(item.basePriceQirsh)).toBe(true);
      expect(item.basePriceQirsh).toBeGreaterThan(0);
    }
  });

  test("sizes have unique values and the default flag is at most one", () => {
    for (const item of menuItemSeeds) {
      if (!item.sizes) continue;
      const values = item.sizes.map((s) => s.value);
      expect(new Set(values).size).toBe(values.length);
      const defaults = item.sizes.filter((s) => s.isDefault === true);
      expect(defaults.length).toBeLessThanOrEqual(1);
    }
  });

  test("modifier group references point at seeded groups", () => {
    const known = new Set(modifierGroupSeeds.map((g) => g.slug));
    for (const item of menuItemSeeds) {
      for (const ref of item.modifierGroupSlugs) {
        expect(known.has(ref)).toBe(true);
      }
    }
  });

  test("seed covers a multi-section spread (>=4 distinct sections)", () => {
    const sections = new Set(menuItemSeeds.map((m) => m.menuSection.en));
    expect(sections.size).toBeGreaterThanOrEqual(4);
  });

  test("seed includes at least one vegan and one gluten-free item", () => {
    const hasVegan = menuItemSeeds.some((m) =>
      m.allergens?.includes("vegan"),
    );
    const hasGlutenFree = menuItemSeeds.some((m) =>
      m.allergens?.includes("gluten-free"),
    );
    expect(hasVegan).toBe(true);
    expect(hasGlutenFree).toBe(true);
  });
});
