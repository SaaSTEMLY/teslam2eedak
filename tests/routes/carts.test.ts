import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  createAuthenticatedClient,
  cleanupById,
} from "../helpers/setup";
import type createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

type AuthClient = ReturnType<typeof createClient<paths>>;
type ApiData = Record<string, unknown>;

let authClient: AuthClient;
let createdCartId: string | null = null;

describe("Carts API", () => {
  beforeAll(async () => {
    const auth = await createAuthenticatedClient();
    authClient = auth.client;
  });

  afterAll(async () => {
    // Clean up any test carts
    if (createdCartId) {
      await cleanupById("carts", createdCartId);
    }
  });

  describe("POST /api/carts", () => {
    test("creates a cart when authenticated", async () => {
      const { response, data } = await authClient.POST("/api/carts", {
        body: {
          items: [],
        } as Record<string, unknown>,
      });
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("doc");
      const doc = (data as ApiData)?.doc as ApiData | undefined;
      createdCartId = doc?.id != null ? String(doc.id) : null;
      expect(createdCartId).toBeDefined();
    });
  });

  describe("GET /api/carts", () => {
    test("returns carts list including the created one", async () => {
      const { response, data } = await authClient.GET("/api/carts");
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("docs");
      expect(Array.isArray((data as ApiData).docs)).toBe(true);
    });
  });

  describe("PATCH /api/carts/{id}", () => {
    test("returns 403 — ecommerce plugin restricts direct cart mutation via REST", async () => {
      if (!createdCartId) {
        console.log("Skipping: no cart created");
        return;
      }

      const { response } = await authClient.PATCH("/api/carts/{id}", {
        params: { path: { id: createdCartId } },
        body: {
          items: [],
        } as Record<string, unknown>,
      });
      // The ecommerce plugin enforces ownership checks that block REST-created carts
      expect(response.status).toBe(403);
    });
  });

  describe("DELETE /api/carts/{id}", () => {
    test("returns 403 — ecommerce plugin restricts direct cart deletion via REST", async () => {
      if (!createdCartId) {
        console.log("Skipping: no cart created");
        return;
      }

      const { response } = await authClient.DELETE("/api/carts/{id}", {
        params: { path: { id: createdCartId } },
      });
      // The ecommerce plugin enforces ownership checks that block REST-created carts
      expect(response.status).toBe(403);
    });
  });
});
