import { describe, test, expect } from "vitest";
import {
  computeLineItemAmount,
  validateModifierSelection,
} from "@/lib/ordering/line-item";

const espressoSizes = [
  { label: "Single", value: "single", priceQirsh: 5_000 },
  { label: "Double", value: "double", priceQirsh: 8_000 },
];

const milkGroup = {
  groupSlug: "milk",
  groupLabel: "Milk Choice",
  minSelectable: 1,
  maxSelectable: 1,
  options: [
    { value: "whole", label: "Whole", priceDelta: 0 },
    { value: "oat", label: "Oat", priceDelta: 3_500 },
    { value: "almond", label: "Almond", priceDelta: 3_500 },
  ],
  selectedValues: ["oat"],
};

const extrasGroup = {
  groupSlug: "extras",
  groupLabel: "Extras",
  minSelectable: 0,
  maxSelectable: 3,
  options: [
    { value: "extra-shot", label: "Extra shot", priceDelta: 2_000 },
    { value: "syrup", label: "Syrup", priceDelta: 2_000 },
    { value: "sauce", label: "Sauce", priceDelta: 2_000 },
  ],
  selectedValues: [],
};

describe("computeLineItemAmount", () => {
  test("base price with no sizes, no modifiers, quantity 1", () => {
    const r = computeLineItemAmount({
      basePriceQirsh: 10_000,
      sizes: [],
      selectedSizeValue: null,
      modifierGroups: [],
      quantity: 1,
    });
    expect(r.unitPriceQirsh).toBe(10_000);
    expect(r.amountQirsh).toBe(10_000);
    expect(r.sizeLabel).toBe(null);
  });

  test("selected size overrides base price and surfaces the label", () => {
    const r = computeLineItemAmount({
      basePriceQirsh: 5_000,
      sizes: espressoSizes,
      selectedSizeValue: "double",
      modifierGroups: [],
      quantity: 1,
    });
    expect(r.unitPriceQirsh).toBe(8_000);
    expect(r.sizeLabel).toBe("Double");
  });

  test("falls back to base price when selected size is unknown", () => {
    const r = computeLineItemAmount({
      basePriceQirsh: 5_000,
      sizes: espressoSizes,
      selectedSizeValue: "huge",
      modifierGroups: [],
      quantity: 1,
    });
    expect(r.unitPriceQirsh).toBe(5_000);
    expect(r.sizeLabel).toBe(null);
  });

  test("modifier deltas add to per-unit price, then quantity multiplies", () => {
    const r = computeLineItemAmount({
      basePriceQirsh: 8_000,
      sizes: espressoSizes,
      selectedSizeValue: "double",
      modifierGroups: [
        milkGroup, // +3,500 oat
        {
          ...extrasGroup,
          selectedValues: ["extra-shot", "syrup"],
        }, // +4,000
      ],
      quantity: 2,
    });
    // 8000 (size double) + 3500 (oat) + 2000 + 2000 = 15500 per unit
    expect(r.unitPriceQirsh).toBe(15_500);
    expect(r.amountQirsh).toBe(31_000);
  });

  test("quantity is clamped to at least 1 and floored", () => {
    expect(
      computeLineItemAmount({
        basePriceQirsh: 1_000,
        sizes: [],
        selectedSizeValue: null,
        modifierGroups: [],
        quantity: 0,
      }).amountQirsh,
    ).toBe(1_000);

    expect(
      computeLineItemAmount({
        basePriceQirsh: 1_000,
        sizes: [],
        selectedSizeValue: null,
        modifierGroups: [],
        quantity: 3.7,
      }).amountQirsh,
    ).toBe(3_000);
  });

  test("ignores selected modifier values that aren't in options", () => {
    const r = computeLineItemAmount({
      basePriceQirsh: 5_000,
      sizes: [],
      selectedSizeValue: null,
      modifierGroups: [
        {
          ...milkGroup,
          selectedValues: ["typo-milk"],
        },
      ],
      quantity: 1,
    });
    expect(r.amountQirsh).toBe(5_000);
  });
});

describe("validateModifierSelection", () => {
  test("a satisfied group has no errors", () => {
    expect(validateModifierSelection([milkGroup])).toEqual([]);
  });

  test("below-min when required selection missing", () => {
    const errs = validateModifierSelection([
      { ...milkGroup, selectedValues: [] },
    ]);
    expect(errs).toHaveLength(1);
    expect(errs[0]).toMatchObject({ kind: "below-min", groupSlug: "milk" });
  });

  test("above-max when too many selected", () => {
    const errs = validateModifierSelection([
      {
        ...extrasGroup,
        selectedValues: ["extra-shot", "syrup", "sauce", "extra-shot"],
      },
    ]);
    expect(errs.some((e) => e.kind === "above-max")).toBe(true);
  });

  test("unknown option is flagged", () => {
    const errs = validateModifierSelection([
      { ...milkGroup, selectedValues: ["soy-but-typo"] },
    ]);
    expect(errs.some((e) => e.kind === "unknown-option")).toBe(true);
    // min not satisfied because the unknown value is still counted as a
    // selection — the below-min error does NOT also fire.
    expect(errs.some((e) => e.kind === "below-min")).toBe(false);
  });

  test("multiple groups validate independently", () => {
    const errs = validateModifierSelection([
      { ...milkGroup, selectedValues: [] }, // below-min
      extrasGroup, // ok
    ]);
    expect(errs).toHaveLength(1);
    expect(errs[0]!.groupSlug).toBe("milk");
  });
});
