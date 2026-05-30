import { describe, test, expect } from "vitest";
import { buildMenuItemPayload } from "@/endpoints/seed/build-menu-item";
import { menuItemSeeds } from "@/endpoints/seed/menu-items";
import { modifierGroupSeeds } from "@/endpoints/seed/modifier-groups";

function makeGroupIdMap(): Map<string, string | number> {
  const map = new Map<string, string | number>();
  modifierGroupSeeds.forEach((g, i) => map.set(g.slug, i + 1));
  return map;
}

describe("buildMenuItemPayload", () => {
  test("returns a payload Payload can accept (en)", () => {
    const ids = makeGroupIdMap();
    const flatWhite = menuItemSeeds.find((i) => i.slug === "flat-white")!;
    const payload = buildMenuItemPayload({
      item: flatWhite,
      modifierGroupIdBySlug: ids,
      locale: "en",
    });
    expect(payload.name).toBe("Flat White");
    expect(payload.menuSection).toBe("Hot Klassiks");
    expect(payload.isAvailable).toBe(true);
    expect(payload._status).toBe("published");
    expect(payload.restaurantId).toBe("kk-main");
  });

  test("localizes name + description + menuSection for ar", () => {
    const ids = makeGroupIdMap();
    const flatWhite = menuItemSeeds.find((i) => i.slug === "flat-white")!;
    const payload = buildMenuItemPayload({
      item: flatWhite,
      modifierGroupIdBySlug: ids,
      locale: "ar",
    });
    expect(payload.name).toBe("فلات وايت");
    expect(payload.menuSection).toBe("كلاسيكس ساخن");
  });

  test("maps modifier-group slugs to seeded ids", () => {
    const ids = makeGroupIdMap();
    const flatWhite = menuItemSeeds.find((i) => i.slug === "flat-white")!;
    const payload = buildMenuItemPayload({
      item: flatWhite,
      modifierGroupIdBySlug: ids,
      locale: "en",
    });
    expect(payload.modifierGroups).toEqual([
      ids.get("milk-choice"),
      ids.get("kk-extras"),
    ]);
  });

  test("emits sizes when present, marks the default", () => {
    const ids = makeGroupIdMap();
    const icedLatte = menuItemSeeds.find((i) => i.slug === "iced-latte")!;
    const payload = buildMenuItemPayload({
      item: icedLatte,
      modifierGroupIdBySlug: ids,
      locale: "en",
    });
    expect(payload.sizes).toEqual([
      { label: "M", value: "m", priceInUSD: 8_000, isDefault: true },
      { label: "L", value: "l", priceInUSD: 10_000, isDefault: false },
    ]);
  });

  test("throws when a modifier-group slug is missing from the id map", () => {
    const partialIds = new Map<string, string | number>([
      ["milk-choice", 1],
      // 'kk-extras' deliberately missing
    ]);
    const flatWhite = menuItemSeeds.find((i) => i.slug === "flat-white")!;
    expect(() =>
      buildMenuItemPayload({
        item: flatWhite,
        modifierGroupIdBySlug: partialIds,
        locale: "en",
      }),
    ).toThrow(/unknown modifier-group "kk-extras"/);
  });

  test("every seeded menu item builds successfully against the full id map", () => {
    const ids = makeGroupIdMap();
    for (const item of menuItemSeeds) {
      for (const locale of ["en", "ar"] as const) {
        const payload = buildMenuItemPayload({
          item,
          modifierGroupIdBySlug: ids,
          locale,
        });
        expect(payload.priceInUSD).toBeGreaterThan(0);
        expect(payload.name.length).toBeGreaterThan(0);
      }
    }
  });
});
