import { describe, test, expect } from "vitest";
import {
  mapHotspotsToSections,
  type HotspotRecord,
} from "@/lib/ordering/menu-image-mapping";

const images = [
  { id: "menu1", url: "/menu1.jpg", label: "Drinks" },
  { id: "menu2", url: "/menu2.jpg", label: "Breakfast" },
  { id: "menu3", url: "/menu3.jpg", label: "All Day" },
] as const;

const box = (
  menuImageId: string,
  locale: string,
  x = 0.1,
  y = 0.2,
): HotspotRecord => ({
  menuImageId,
  locale,
  x,
  y,
  w: 0.1,
  h: 0.1,
});

describe("mapHotspotsToSections", () => {
  test("buckets hotspots by image id", () => {
    const items = [
      { id: 1, hotspots: [box("menu1", "en"), box("menu2", "en", 0.3)] },
      { id: 2, hotspots: [box("menu1", "en", 0.4)] },
      { id: 3, hotspots: [box("menu3", "en")] },
    ];
    const out = mapHotspotsToSections({ images, items, locale: "en" });
    expect(out).toHaveLength(3);
    expect(out[0]!.image.id).toBe("menu1");
    expect(out[0]!.hotspots.map((h) => h.item.id)).toEqual([1, 2]);
    expect(out[1]!.hotspots.map((h) => h.item.id)).toEqual([1]);
    expect(out[2]!.hotspots.map((h) => h.item.id)).toEqual([3]);
  });

  test("filters by locale — ar hotspots aren't shown to en viewers", () => {
    const items = [
      {
        id: 9,
        hotspots: [box("menu1", "ar"), box("menu1", "en", 0.5, 0.5)],
      },
    ];
    const en = mapHotspotsToSections({ images, items, locale: "en" });
    const ar = mapHotspotsToSections({ images, items, locale: "ar" });
    expect(en[0]!.hotspots).toHaveLength(1);
    expect(en[0]!.hotspots[0]!.box.x).toBe(0.5);
    expect(ar[0]!.hotspots).toHaveLength(1);
    expect(ar[0]!.hotspots[0]!.box.x).toBe(0.1);
  });

  test("an item with multiple hotspots on the same image is included for each", () => {
    const items = [
      {
        id: 1,
        hotspots: [
          box("menu1", "en", 0.1),
          box("menu1", "en", 0.4),
        ],
      },
    ];
    const out = mapHotspotsToSections({ images, items, locale: "en" });
    expect(out[0]!.hotspots).toHaveLength(2);
  });

  test("preserves image order from input", () => {
    const reordered = [images[2]!, images[0]!, images[1]!];
    const out = mapHotspotsToSections({
      images: reordered,
      items: [],
      locale: "en",
    });
    expect(out.map((s) => s.image.id)).toEqual(["menu3", "menu1", "menu2"]);
  });

  test("empty input produces an empty hotspot list per section", () => {
    const out = mapHotspotsToSections({ images, items: [], locale: "en" });
    expect(out.every((s) => s.hotspots.length === 0)).toBe(true);
  });
});
