import { describe, test, expect } from "vitest";
import {
  rectToNormalized,
  normalizedToRect,
  hitTest,
  validateHotspot,
} from "@/lib/ordering/hotspot";

const dims = { displayedWidth: 1000, displayedHeight: 500 };

describe("rectToNormalized", () => {
  test("normalizes a forward-drawn rect", () => {
    expect(rectToNormalized({ x: 100, y: 50, w: 200, h: 100 }, dims)).toEqual({
      x: 0.1,
      y: 0.1,
      w: 0.2,
      h: 0.2,
    });
  });

  test("normalizes a right-to-left drag (negative width) to the same rect", () => {
    expect(
      rectToNormalized({ x: 300, y: 150, w: -200, h: -100 }, dims),
    ).toEqual({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 });
  });

  test("clamps to image bounds when the user drags outside", () => {
    const out = rectToNormalized(
      { x: -100, y: -50, w: 1500, h: 800 },
      dims,
    );
    expect(out.x).toBe(0);
    expect(out.y).toBe(0);
    expect(out.w).toBeLessThanOrEqual(1);
    expect(out.h).toBeLessThanOrEqual(1);
  });
});

describe("normalizedToRect", () => {
  test("is the inverse of rectToNormalized for in-bounds rects", () => {
    const px = { x: 100, y: 50, w: 200, h: 100 };
    const norm = rectToNormalized(px, dims);
    expect(normalizedToRect(norm, dims)).toEqual(px);
  });
});

describe("hitTest", () => {
  const box = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };

  test("points inside the box hit", () => {
    expect(hitTest({ x: 0.2, y: 0.3 }, box)).toBe(true);
    expect(hitTest({ x: 0.1, y: 0.2 }, box)).toBe(true); // top-left edge
    expect(hitTest({ x: 0.4, y: 0.6 }, box)).toBe(true); // bottom-right edge
  });

  test("points outside the box miss", () => {
    expect(hitTest({ x: 0.0, y: 0.0 }, box)).toBe(false);
    expect(hitTest({ x: 0.5, y: 0.5 }, box)).toBe(false);
    expect(hitTest({ x: 0.2, y: 0.0 }, box)).toBe(false); // above
  });
});

describe("validateHotspot", () => {
  const ok = {
    locale: "en",
    menuImageId: "img-1",
    x: 0.1,
    y: 0.1,
    w: 0.1,
    h: 0.1,
    menuItemId: 42,
  };

  test("accepts a well-formed in-bounds hotspot linked to an item", () => {
    expect(validateHotspot(ok)).toBe(null);
  });

  test("rejects an out-of-bounds hotspot", () => {
    expect(validateHotspot({ ...ok, x: 0.95, w: 0.2 })?.kind).toBe(
      "out-of-bounds",
    );
    expect(validateHotspot({ ...ok, x: -0.1 })?.kind).toBe("out-of-bounds");
  });

  test("rejects a too-small hotspot (< 2% × 2%)", () => {
    expect(validateHotspot({ ...ok, w: 0.01 })?.kind).toBe("too-small");
    expect(validateHotspot({ ...ok, h: 0.01 })?.kind).toBe("too-small");
  });

  test("rejects a hotspot without a menuItemId link", () => {
    expect(validateHotspot({ ...ok, menuItemId: null })?.kind).toBe(
      "missing-link",
    );
    expect(validateHotspot({ ...ok, menuItemId: "" })?.kind).toBe(
      "missing-link",
    );
  });
});
