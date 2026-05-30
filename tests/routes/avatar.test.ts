import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/avatar", () => {
  test("returns SVG with valid seed", async () => {
    const res = await rawGet("/api/avatar?seed=testuser123");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    const body = await res.text();
    expect(body).toContain("<svg");
  });

  test("returns 400 without seed param", async () => {
    const res = await rawGet("/api/avatar");
    expect(res.status).toBe(400);
  });

  test("returns different SVGs for different seeds", async () => {
    const res1 = await rawGet("/api/avatar?seed=user-a");
    const res2 = await rawGet("/api/avatar?seed=user-b");
    const svg1 = await res1.text();
    const svg2 = await res2.text();
    expect(svg1).not.toBe(svg2);
  });
});
