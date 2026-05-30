import { describe, test, expect } from "vitest";
import { resolveMenuContext } from "@/lib/ordering/menu-context";

describe("resolveMenuContext", () => {
  test("recognises a table QR via ?t=", () => {
    expect(resolveMenuContext({ searchParams: { t: "X7K2P9" } })).toEqual({
      kind: "table",
      tableShortId: "X7K2P9",
    });
  });

  test("trims surrounding whitespace on shortId", () => {
    expect(resolveMenuContext({ searchParams: { t: "  ABC  " } })).toEqual({
      kind: "table",
      tableShortId: "ABC",
    });
  });

  test("empty ?t= falls through to default", () => {
    expect(resolveMenuContext({ searchParams: { t: "  " } })).toEqual({
      kind: "default",
      mode: "pickup",
    });
  });

  test("?mode=pickup&l=maadi → pickup at the named branch", () => {
    expect(
      resolveMenuContext({
        searchParams: { mode: "pickup", l: "maadi" },
      }),
    ).toEqual({ kind: "pickup", locationSlug: "maadi" });
  });

  test("?mode=pickup with no slug → branch chosen in UI", () => {
    expect(resolveMenuContext({ searchParams: { mode: "pickup" } })).toEqual({
      kind: "pickup",
      locationSlug: null,
    });
  });

  test("array params (Next.js can pass either) take the first value", () => {
    expect(
      resolveMenuContext({ searchParams: { t: ["X1", "X2"] } }),
    ).toEqual({ kind: "table", tableShortId: "X1" });
  });

  test("table QR beats mode=pickup when both present", () => {
    expect(
      resolveMenuContext({
        searchParams: { t: "T1", mode: "pickup", l: "maadi" },
      }),
    ).toEqual({ kind: "table", tableShortId: "T1" });
  });

  test("?mode=delivery → default kind with delivery mode", () => {
    expect(resolveMenuContext({ searchParams: { mode: "delivery" } })).toEqual({
      kind: "default",
      mode: "delivery",
    });
  });

  test("invalid mode falls back to defaultMode", () => {
    expect(
      resolveMenuContext({
        searchParams: { mode: "garbage" },
        defaultMode: "merch",
      }),
    ).toEqual({ kind: "default", mode: "merch" });
  });
});
