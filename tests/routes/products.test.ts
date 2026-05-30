import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/products", () => {
  test("returns 200 with docs array and pagination", async () => {
    const res = await rawGet("/api/products");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("docs");
    expect(Array.isArray(data.docs)).toBe(true);
    expect(data).toHaveProperty("totalDocs");
    expect(data).toHaveProperty("totalPages");
    expect(data).toHaveProperty("page");
    expect(data).toHaveProperty("hasNextPage");
    expect(data).toHaveProperty("hasPrevPage");
  });

  test("returns product with expected fields when data exists", async () => {
    const res = await rawGet("/api/products");
    const data = await res.json();
    if (data.docs.length > 0) {
      const product = data.docs[0];
      expect(product).toHaveProperty("id");
      expect(product).toHaveProperty("name");
    }
  });

  test("fetches single product by ID when data exists", async () => {
    const listRes = await rawGet("/api/products");
    const listData = await listRes.json();
    if (listData.docs.length > 0) {
      const id = listData.docs[0].id;
      const res = await rawGet(`/api/products/${id}`);
      expect(res.status).toBe(200);
      const product = await res.json();
      expect(product).toHaveProperty("id", id);
    }
  });
});
