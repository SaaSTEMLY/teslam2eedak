import { describe, test, expect } from "vitest";
import {
  formatMenuForPrompt,
  parseAssistantResponse,
  type MenuItemForAI,
  type ModifierGroupForAI,
} from "@/lib/ai/menu-context";

const milkGroup: ModifierGroupForAI = {
  slug: "milk-choice",
  name: "Milk Choice",
  minSelectable: 1,
  maxSelectable: 1,
  options: [
    { value: "whole", label: "Whole", priceDelta: 0 },
    { value: "oat", label: "Oat", priceDelta: 3_500 },
  ],
};

const extrasGroup: ModifierGroupForAI = {
  slug: "kk-extras",
  name: "Extras",
  minSelectable: 0,
  maxSelectable: 3,
  options: [
    { value: "extra-shot", label: "Extra shot", priceDelta: 2_000 },
  ],
};

const flatWhite: MenuItemForAI = {
  id: 1,
  slug: "flat-white",
  name: "Flat White",
  description: "Velvet milk on a double shot.",
  section: "Hot Klassiks",
  basePriceQirsh: 7_000,
  allergens: ["vegetarian"],
  sizes: [],
  modifierGroupSlugs: ["milk-choice", "kk-extras"],
  available: true,
};

const icedLatte: MenuItemForAI = {
  id: 2,
  slug: "iced-latte",
  name: "Iced Latte",
  description: "Double shot over cold milk and ice.",
  section: "Kold Klassiks",
  basePriceQirsh: 8_000,
  allergens: ["vegetarian"],
  sizes: [
    { label: "M", value: "m", priceQirsh: 8_000 },
    { label: "L", value: "l", priceQirsh: 10_000 },
  ],
  modifierGroupSlugs: ["milk-choice"],
  available: true,
};

const soldOut: MenuItemForAI = {
  ...flatWhite,
  slug: "sold-out-thing",
  name: "Sold Out",
  available: false,
};

describe("formatMenuForPrompt", () => {
  test("groups items by section header", () => {
    const out = formatMenuForPrompt({
      items: [flatWhite, icedLatte],
      modifierGroups: [milkGroup, extrasGroup],
    });
    expect(out).toMatch(/## Hot Klassiks/);
    expect(out).toMatch(/## Kold Klassiks/);
  });

  test("emits the [slug] for Claude to reference unambiguously", () => {
    const out = formatMenuForPrompt({
      items: [flatWhite],
      modifierGroups: [milkGroup, extrasGroup],
    });
    expect(out).toMatch(/\[flat-white\]/);
  });

  test("renders sizes as 'M 80 LE / L 100 LE'", () => {
    const out = formatMenuForPrompt({
      items: [icedLatte],
      modifierGroups: [milkGroup],
    });
    expect(out).toMatch(/M 80 LE \/ L 100 LE/);
  });

  test("includes modifier options with price deltas", () => {
    const out = formatMenuForPrompt({
      items: [flatWhite],
      modifierGroups: [milkGroup, extrasGroup],
    });
    expect(out).toMatch(/oat=Oat \(\+35 LE\)/);
    expect(out).toMatch(/extra-shot=Extra shot \(\+20 LE\)/);
  });

  test("omits sold-out items", () => {
    const out = formatMenuForPrompt({
      items: [flatWhite, soldOut],
      modifierGroups: [milkGroup, extrasGroup],
    });
    expect(out).not.toMatch(/Sold Out/);
  });

  test("includes allergen tags", () => {
    const out = formatMenuForPrompt({
      items: [flatWhite],
      modifierGroups: [milkGroup, extrasGroup],
    });
    expect(out).toMatch(/Allergens: vegetarian/);
  });
});

describe("parseAssistantResponse", () => {
  const knownItems = new Set(["flat-white", "iced-latte"]);
  const knownGroups = new Set(["milk-choice", "kk-extras"]);

  test("happy path: well-formed suggestion passes through", () => {
    const r = parseAssistantResponse({
      raw: {
        suggestions: [
          {
            itemSlug: "flat-white",
            sizeValue: null,
            modifierSelections: [
              { groupSlug: "milk-choice", optionValues: ["oat"] },
            ],
            quantity: 1,
            reason: "Cosy and not too sweet.",
          },
        ],
        explanation: "Try a Flat White with oat milk.",
      },
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions).toHaveLength(1);
    expect(r.droppedCount).toBe(0);
    expect(r.explanation).toBe("Try a Flat White with oat milk.");
  });

  test("drops suggestions for unknown items (model hallucination)", () => {
    const r = parseAssistantResponse({
      raw: {
        suggestions: [
          { itemSlug: "made-up-frappe", quantity: 1, reason: "X" },
          { itemSlug: "iced-latte", quantity: 1, reason: "Y" },
        ],
      },
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions.map((s) => s.itemSlug)).toEqual(["iced-latte"]);
    expect(r.droppedCount).toBe(1);
  });

  test("clamps quantity to 1–10 and floors fractional values", () => {
    const r = parseAssistantResponse({
      raw: {
        suggestions: [
          { itemSlug: "flat-white", quantity: 0, reason: "" },
          { itemSlug: "flat-white", quantity: 9999, reason: "" },
          { itemSlug: "flat-white", quantity: 3.7, reason: "" },
        ],
      },
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions.map((s) => s.quantity)).toEqual([1, 10, 3]);
  });

  test("strips modifier groups not in the catalogue", () => {
    const r = parseAssistantResponse({
      raw: {
        suggestions: [
          {
            itemSlug: "flat-white",
            modifierSelections: [
              { groupSlug: "fictional-syrup-of-doom", optionValues: ["x"] },
              { groupSlug: "milk-choice", optionValues: ["oat"] },
            ],
          },
        ],
      },
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions[0]!.modifierSelections.map((m) => m.groupSlug)).toEqual(
      ["milk-choice"],
    );
  });

  test("ignores non-array suggestions field", () => {
    const r = parseAssistantResponse({
      raw: { suggestions: "not an array", explanation: "boom" },
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions).toEqual([]);
    expect(r.explanation).toBe("boom");
  });

  test("handles totally empty / malformed payload without throwing", () => {
    const r = parseAssistantResponse({
      raw: undefined,
      knownItemSlugs: knownItems,
      knownModifierGroupSlugs: knownGroups,
    });
    expect(r.suggestions).toEqual([]);
    expect(r.droppedCount).toBe(0);
    expect(r.explanation).toBe("");
  });
});
