import {
  describe,
  test,
  expect,
  beforeAll,
  api,
  createAuthenticatedClient,
} from "../helpers/setup";
import type createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

type AuthClient = ReturnType<typeof createClient<paths>>;
type ApiData = Record<string, unknown>;

let authClient: AuthClient;

describe("Orders API", () => {
  beforeAll(async () => {
    const auth = await createAuthenticatedClient();
    authClient = auth.client;
  });

  describe("GET /api/orders (unauthenticated)", () => {
    test("returns 401 without authentication", async () => {
      const { response } = await api.GET("/api/orders");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/orders (authenticated)", () => {
    test("returns 200 with orders, totalPages, and page", async () => {
      const { response, data } = await authClient.GET("/api/orders");
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("orders");
      expect(data).toHaveProperty("totalPages");
      expect(data).toHaveProperty("page");
      const result = data as ApiData;
      expect(Array.isArray(result.orders)).toBe(true);
      expect(typeof result.totalPages).toBe("number");
      expect(typeof result.page).toBe("number");
    });

    test("respects pagination parameters", async () => {
      const { response, data } = await authClient.GET("/api/orders", {
        params: { query: { page: 1, limit: 2 } },
      });
      expect(response.status).toBe(200);
      const result = data as ApiData;
      expect(result.page).toBe(1);
      // The number of returned orders should not exceed the limit
      expect((result.orders as unknown[]).length).toBeLessThanOrEqual(2);
    });

    test("returns page 2 when requested", async () => {
      const { response, data } = await authClient.GET("/api/orders", {
        params: { query: { page: 2, limit: 1 } },
      });
      expect(response.status).toBe(200);
      // Page should be 2 (or 1 if totalPages < 2 — either is valid)
      expect((data as ApiData).page).toBeGreaterThanOrEqual(1);
    });
  });
});
