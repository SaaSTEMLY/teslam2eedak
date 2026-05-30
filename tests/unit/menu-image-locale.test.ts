import { describe, test, expect } from "vitest";
import {
  pickImageUrlForLocale,
  defaultLocalizedUrlsForBase,
} from "@/lib/ordering/menu-image-locale";

const variants = {
  id: "menu1",
  label: "Drinks",
  baseUrl: "/menu1.jpg",
  localizedUrls: { ar: "/menu1-ar.jpg" },
};

describe("pickImageUrlForLocale", () => {
  test("returns the locale-specific url when one is set", () => {
    expect(pickImageUrlForLocale(variants, "ar")).toBe("/menu1-ar.jpg");
  });

  test("falls back to the base url when no localized url exists for the locale", () => {
    expect(pickImageUrlForLocale(variants, "es")).toBe("/menu1.jpg");
  });

  test("falls back to the explicit fallback locale before the base url", () => {
    const v = {
      ...variants,
      baseUrl: "/menu1.jpg",
      localizedUrls: { en: "/menu1-en.jpg", ar: "/menu1-ar.jpg" },
    };
    expect(pickImageUrlForLocale(v, "es")).toBe("/menu1-en.jpg");
  });

  test("returns the base url when localizedUrls is undefined entirely", () => {
    expect(
      pickImageUrlForLocale(
        { id: "x", label: "x", baseUrl: "/x.jpg" },
        "ar",
      ),
    ).toBe("/x.jpg");
  });

  test("works with arbitrary locale codes", () => {
    expect(pickImageUrlForLocale(variants, "fr")).toBe("/menu1.jpg");
  });
});

describe("defaultLocalizedUrlsForBase", () => {
  test("derives -ar and -es siblings from the base url", () => {
    expect(defaultLocalizedUrlsForBase("/menu1.jpg")).toEqual({
      ar: "/menu1-ar.jpg",
      es: "/menu1-es.jpg",
    });
  });

  test("handles arbitrary extensions (.png, .webp)", () => {
    expect(defaultLocalizedUrlsForBase("/menu2.png")).toEqual({
      ar: "/menu2-ar.png",
      es: "/menu2-es.png",
    });
    expect(defaultLocalizedUrlsForBase("/menu3.webp")).toEqual({
      ar: "/menu3-ar.webp",
      es: "/menu3-es.webp",
    });
  });

  test("returns an empty map when the url has no extension", () => {
    expect(defaultLocalizedUrlsForBase("/no-ext")).toEqual({});
  });
});
