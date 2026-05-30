import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/faqs", () => {
  test("returns 200 with docs array and pagination", async () => {
    const res = await rawGet("/api/faqs");
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

  test("returns FAQ with expected fields when data exists", async () => {
    const res = await rawGet("/api/faqs");
    const data = await res.json();
    if (data.docs.length > 0) {
      const faq = data.docs[0];
      expect(faq).toHaveProperty("id");
      expect(faq).toHaveProperty("question");
      expect(faq).toHaveProperty("answer");
    }
  });
});
