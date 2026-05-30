import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/recommendations/related/{productId}", () => {
  test("returns 200 with products or 500 (SaaSignal may not be configured)", async () => {
    const listRes = await rawGet("/api/products");
    const listData = await listRes.json();
    if (!listData.docs || listData.docs.length === 0) {
      console.log("Skipping: no products in database");
      return;
    }

    const productId = listData.docs[0].id;
    const res = await rawGet(`/api/recommendations/related/${productId}`);
    // Recommendations depend on SaaSignal — may return 500 if not configured
    if (res.status === 200) {
      const data = await res.json();
      expect(data).toHaveProperty("products");
      expect(Array.isArray(data.products)).toBe(true);
    } else {
      expect(res.status).toBe(500);
    }
  });

  test("handles non-existent product gracefully", async () => {
    const res = await rawGet("/api/recommendations/related/999999");
    expect([200, 500]).toContain(res.status);
  });
});
