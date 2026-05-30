import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/blogs", () => {
  test("returns 200 with docs array and pagination", async () => {
    const res = await rawGet("/api/blogs");
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

  test("returns blog with expected fields when data exists", async () => {
    const res = await rawGet("/api/blogs");
    const data = await res.json();
    if (data.docs.length > 0) {
      const blog = data.docs[0];
      expect(blog).toHaveProperty("id");
      expect(blog).toHaveProperty("title");
    }
  });

  test("fetches single blog by ID when data exists", async () => {
    const listRes = await rawGet("/api/blogs");
    const listData = await listRes.json();
    if (listData.docs.length > 0) {
      const id = listData.docs[0].id;
      const res = await rawGet(`/api/blogs/${id}`);
      expect(res.status).toBe(200);
      const blog = await res.json();
      expect(blog).toHaveProperty("id", id);
    }
  });
});
