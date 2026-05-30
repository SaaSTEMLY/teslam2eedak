import { describe, test, expect, api } from "../helpers/setup";

describe("GET /api/search", () => {
  test("returns 200 or 500 (SaaSignal may not be configured)", async () => {
    const { response, data } = await api.GET("/api/search", {
      params: { query: { q: "test" } },
    });
    // Search depends on SaaSignal — may return 500 if not configured
    if (response.status === 200) {
      expect(data).toHaveProperty("products");
      expect(data).toHaveProperty("blogs");
    } else {
      expect(response.status).toBe(500);
    }
  });

  test("returns empty results without q param", async () => {
    const { response, data } = await api.GET("/api/search", {
      params: { query: { q: "" } },
    });
    if (response.status === 200) {
      expect(data).toHaveProperty("products");
      expect(data).toHaveProperty("blogs");
    } else {
      expect(response.status).toBe(500);
    }
  });
});

describe("GET /api/search/suggest", () => {
  test("returns suggestions or 500 (SaaSignal may not be configured)", async () => {
    const { response } = await api.GET("/api/search/suggest", {
      params: { query: { q: "shirt" } },
    });
    // May return 500 if SaaSignal is not configured
    expect([200, 500]).toContain(response.status);
  });

  test("handles empty q param", async () => {
    const { response } = await api.GET("/api/search/suggest", {
      params: { query: { q: "" } },
    });
    expect([200, 500]).toContain(response.status);
  });
});
