import { describe, test, expect, rawGet } from "../helpers/setup";

describe("GET /api/openapi.json", () => {
  test("returns valid OpenAPI 3.1.0 spec", async () => {
    const res = await rawGet("/api/openapi.json");
    expect(res.status).toBe(200);
    const spec = await res.json();
    expect(spec).toHaveProperty("openapi", "3.1.0");
    expect(spec).toHaveProperty("info");
    expect(spec).toHaveProperty("paths");
  });
});

describe("GET /api/docs", () => {
  test("returns HTML documentation page", async () => {
    const res = await rawGet("/api/docs");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("API Documentation");
    expect(html).toContain("api-reference");
  });
});

describe("GET /llms.txt", () => {
  test("returns plain text", async () => {
    const res = await rawGet("/llms.txt");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("GET /to-humans.md", () => {
  test("returns markdown", async () => {
    const res = await rawGet("/to-humans.md");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");
    const md = await res.text();
    expect(md.length).toBeGreaterThan(0);
  });
});
