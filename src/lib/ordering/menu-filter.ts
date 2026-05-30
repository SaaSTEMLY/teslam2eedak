/**
 * Allergen filter — purely declarative. The customer header has a row of
 * dietary toggles (vegan, vegetarian, dairy-free, gluten-free). Active
 * toggles do NOT remove items — per GOAL §5, they dim hotspots and
 * disable add-to-cart so the menu's visual composition is preserved.
 *
 * The semantics are exclusionary by default:
 *   - "vegan" active     → an item matches if its allergens include "vegan".
 *   - "gluten-free" active → match if "gluten-free" is in allergens.
 *   - "dairy-free" active → match if "dairy-free" OR "vegan".
 *
 * Multiple active toggles are ANDed (an item must match every requested
 * preference) to model "I am vegan AND gluten-free."
 */

export type AllergenTag =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free"
  | "contains-nuts"
  | "contains-soy"
  | "contains-eggs";

export type DietaryPreference =
  | "vegan"
  | "vegetarian"
  | "gluten-free"
  | "dairy-free";

const IMPLIES: Record<DietaryPreference, ReadonlyArray<AllergenTag>> = {
  vegan: ["vegan"],
  vegetarian: ["vegetarian", "vegan"],
  "gluten-free": ["gluten-free"],
  "dairy-free": ["dairy-free", "vegan"],
};

export interface MatchInput {
  readonly itemAllergens: ReadonlyArray<AllergenTag>;
  readonly activePreferences: ReadonlyArray<DietaryPreference>;
}

export function matchesDietaryPreferences(input: MatchInput): boolean {
  if (input.activePreferences.length === 0) return true;
  const tags = new Set<AllergenTag>(input.itemAllergens);
  return input.activePreferences.every((pref) =>
    IMPLIES[pref].some((satisfier) => tags.has(satisfier)),
  );
}

/**
 * Decorate a list of menu items with a `dimmed` flag for UI rendering.
 * Items that don't match the active preferences stay visible but are
 * dimmed and have add-to-cart disabled — see GOAL §5.
 */
export function applyAllergenFilter<
  T extends { allergens?: ReadonlyArray<AllergenTag> | null },
>(items: ReadonlyArray<T>, activePreferences: ReadonlyArray<DietaryPreference>) {
  return items.map((item) => ({
    item,
    dimmed: !matchesDietaryPreferences({
      itemAllergens: item.allergens ?? [],
      activePreferences,
    }),
  }));
}
