import { describe, test, expect } from "vitest";
import {
  addToCart,
  removeLine,
  setLineQuantity,
  totalQuantity,
  subtotalQirsh,
  EMPTY_CART,
  type CartLineSelection,
} from "@/lib/ordering/cart-store";

const espresso: CartLineSelection = {
  itemId: 1,
  sizeValue: "double",
  modifierSelections: [
    { groupSlug: "milk", optionValues: ["oat"] },
  ],
  quantity: 1,
  note: "",
  amountQirsh: 11_500,
};

const bagel: CartLineSelection = {
  itemId: 2,
  sizeValue: null,
  modifierSelections: [],
  quantity: 1,
  note: "no onions",
  amountQirsh: 23_500,
};

describe("addToCart", () => {
  test("first add creates a new line", () => {
    const c = addToCart(EMPTY_CART, espresso);
    expect(c.lines).toHaveLength(1);
    expect(c.lines[0]!.quantity).toBe(1);
  });

  test("identical config collapses into one line with summed quantity", () => {
    const a = addToCart(EMPTY_CART, espresso);
    const b = addToCart(a, espresso);
    expect(b.lines).toHaveLength(1);
    expect(b.lines[0]!.quantity).toBe(2);
    expect(b.lines[0]!.amountQirsh).toBe(23_000);
  });

  test("different size keeps lines separate", () => {
    const a = addToCart(EMPTY_CART, espresso);
    const b = addToCart(a, { ...espresso, sizeValue: "single" });
    expect(b.lines).toHaveLength(2);
  });

  test("different modifier selection keeps lines separate", () => {
    const a = addToCart(EMPTY_CART, espresso);
    const b = addToCart(a, {
      ...espresso,
      modifierSelections: [{ groupSlug: "milk", optionValues: ["almond"] }],
    });
    expect(b.lines).toHaveLength(2);
  });

  test("different note keeps lines separate", () => {
    const a = addToCart(EMPTY_CART, espresso);
    const b = addToCart(a, { ...espresso, note: "extra hot" });
    expect(b.lines).toHaveLength(2);
  });

  test("modifier value order doesn't matter for signature", () => {
    const a = addToCart(EMPTY_CART, {
      ...espresso,
      modifierSelections: [
        { groupSlug: "extras", optionValues: ["shot", "syrup"] },
      ],
    });
    const b = addToCart(a, {
      ...espresso,
      modifierSelections: [
        { groupSlug: "extras", optionValues: ["syrup", "shot"] },
      ],
    });
    expect(b.lines).toHaveLength(1);
    expect(b.lines[0]!.quantity).toBe(2);
  });

  test("zero or negative quantity is dropped", () => {
    expect(addToCart(EMPTY_CART, { ...espresso, quantity: 0 }).lines).toEqual([]);
    expect(addToCart(EMPTY_CART, { ...espresso, quantity: -3 }).lines).toEqual([]);
  });
});

describe("setLineQuantity / removeLine", () => {
  test("setLineQuantity updates the amount proportionally", () => {
    const c = addToCart(EMPTY_CART, espresso); // 11500 × 1
    const id = c.lines[0]!.id;
    const next = setLineQuantity(c, id, 3);
    expect(next.lines[0]!.quantity).toBe(3);
    expect(next.lines[0]!.amountQirsh).toBe(34_500);
  });

  test("setLineQuantity to 0 removes the line", () => {
    const c = addToCart(EMPTY_CART, espresso);
    const id = c.lines[0]!.id;
    expect(setLineQuantity(c, id, 0).lines).toEqual([]);
  });

  test("removeLine drops by id", () => {
    const c = addToCart(addToCart(EMPTY_CART, espresso), bagel);
    expect(c.lines).toHaveLength(2);
    expect(removeLine(c, c.lines[0]!.id).lines).toHaveLength(1);
  });
});

describe("totalQuantity / subtotalQirsh", () => {
  test("sums across all lines", () => {
    const c = addToCart(addToCart(EMPTY_CART, espresso), bagel);
    expect(totalQuantity(c)).toBe(2);
    expect(subtotalQirsh(c)).toBe(11_500 + 23_500);
  });

  test("empty cart sums to zero", () => {
    expect(totalQuantity(EMPTY_CART)).toBe(0);
    expect(subtotalQirsh(EMPTY_CART)).toBe(0);
  });
});
