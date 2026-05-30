import { describe, test, expect } from "vitest";
import {
  matchesDietaryPreferences,
  applyAllergenFilter,
  type AllergenTag,
} from "@/lib/ordering/menu-filter";

describe("matchesDietaryPreferences", () => {
  test("no active preferences → everything matches", () => {
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["contains-nuts"],
        activePreferences: [],
      }),
    ).toBe(true);
  });

  test("vegan preference requires the vegan tag", () => {
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegan"],
        activePreferences: ["vegan"],
      }),
    ).toBe(true);
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegetarian"],
        activePreferences: ["vegan"],
      }),
    ).toBe(false);
  });

  test("vegetarian preference accepts vegan items too", () => {
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegan"],
        activePreferences: ["vegetarian"],
      }),
    ).toBe(true);
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegetarian"],
        activePreferences: ["vegetarian"],
      }),
    ).toBe(true);
  });

  test("dairy-free preference accepts vegan items too", () => {
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegan"],
        activePreferences: ["dairy-free"],
      }),
    ).toBe(true);
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["dairy-free"],
        activePreferences: ["dairy-free"],
      }),
    ).toBe(true);
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegetarian"],
        activePreferences: ["dairy-free"],
      }),
    ).toBe(false);
  });

  test("multiple preferences are ANDed together", () => {
    // vegan AND gluten-free → item must satisfy both
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegan", "gluten-free"],
        activePreferences: ["vegan", "gluten-free"],
      }),
    ).toBe(true);
    expect(
      matchesDietaryPreferences({
        itemAllergens: ["vegan"],
        activePreferences: ["vegan", "gluten-free"],
      }),
    ).toBe(false);
  });
});

describe("applyAllergenFilter", () => {
  const items: ReadonlyArray<{
    id: number;
    allergens: ReadonlyArray<AllergenTag>;
  }> = [
    { id: 1, allergens: ["vegan", "gluten-free"] },
    { id: 2, allergens: ["contains-nuts"] },
    { id: 3, allergens: [] },
  ];

  test("decorates every item with a dimmed flag (no filter)", () => {
    const r = applyAllergenFilter(items, []);
    expect(r).toHaveLength(3);
    expect(r.every((d) => d.dimmed === false)).toBe(true);
  });

  test("dims non-matching items but does not remove them", () => {
    const r = applyAllergenFilter(items, ["vegan"]);
    expect(r).toHaveLength(3);
    expect(r[0]!.dimmed).toBe(false); // vegan ✓
    expect(r[1]!.dimmed).toBe(true); // contains-nuts only
    expect(r[2]!.dimmed).toBe(true); // empty allergens
  });

  test("items with null allergens are treated as empty (dimmed under filter)", () => {
    const r = applyAllergenFilter(
      [{ id: 9, allergens: null }],
      ["vegan"],
    );
    expect(r[0]!.dimmed).toBe(true);
  });
});
