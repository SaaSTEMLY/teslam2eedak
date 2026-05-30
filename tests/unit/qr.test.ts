import { describe, test, expect } from "vitest";
import {
  buildTableMenuUrl,
  buildPickupMenuUrl,
  renderQrSvg,
} from "@/lib/ordering/qr";

describe("buildTableMenuUrl", () => {
  test("encodes the short id and appends to /menu?t=", () => {
    expect(
      buildTableMenuUrl({
        baseUrl: "https://koffee-kulture.com",
        tableShortId: "X7K2P9",
      }),
    ).toBe("https://koffee-kulture.com/menu?t=X7K2P9");
  });

  test("strips trailing slash on base url", () => {
    expect(
      buildTableMenuUrl({
        baseUrl: "https://koffee-kulture.com/",
        tableShortId: "ABC123",
      }),
    ).toBe("https://koffee-kulture.com/menu?t=ABC123");
  });

  test("URI-encodes unusual characters", () => {
    expect(
      buildTableMenuUrl({
        baseUrl: "https://k.co",
        tableShortId: "a/b c",
      }),
    ).toBe("https://k.co/menu?t=a%2Fb%20c");
  });
});

describe("buildPickupMenuUrl", () => {
  test("with locationSlug", () => {
    expect(
      buildPickupMenuUrl({
        baseUrl: "https://koffee-kulture.com",
        locationSlug: "maadi",
      }),
    ).toBe("https://koffee-kulture.com/menu?mode=pickup&l=maadi");
  });

  test("without locationSlug — generic pickup QR", () => {
    expect(
      buildPickupMenuUrl({ baseUrl: "https://koffee-kulture.com" }),
    ).toBe("https://koffee-kulture.com/menu?mode=pickup");
  });

  test("strips trailing slash", () => {
    expect(
      buildPickupMenuUrl({
        baseUrl: "https://koffee-kulture.com///",
        locationSlug: "maadi",
      }),
    ).toBe("https://koffee-kulture.com/menu?mode=pickup&l=maadi");
  });
});

describe("renderQrSvg", () => {
  test("produces an SVG string scannable by QR decoders", async () => {
    const svg = await renderQrSvg("https://koffee-kulture.com/menu?t=ABC123");
    // Cheap structural check: it's an SVG with the brand cream + sage applied.
    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain("#7a8f4f"); // brand sage default
    expect(svg).toContain("#f2ead0"); // brand cream default
  });

  test("honours custom width and colors", async () => {
    const svg = await renderQrSvg("https://k.co/menu?t=X", {
      width: 512,
      darkColor: "#000000",
      lightColor: "#ffffff",
    });
    expect(svg).toContain("#000000");
    expect(svg).toContain("#ffffff");
    expect(svg).toMatch(/width="512"/);
  });
});
