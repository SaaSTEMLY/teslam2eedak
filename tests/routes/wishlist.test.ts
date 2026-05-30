import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  api,
  rawGet,
  createAuthenticatedClient,
  cleanupByField,
} from "../helpers/setup";
import type createClient from "openapi-fetch";
import type { paths } from "../../src/lib/api/types";

type AuthClient = ReturnType<typeof createClient<paths>>;
type ApiData = Record<string, unknown>;

let authClient: AuthClient;
let testProductId: number | null = null;
let testUserId: string | null = null;
let wishlistItemId: number | null = null;

describe("Wishlist API", () => {
  beforeAll(async () => {
    const auth = await createAuthenticatedClient();
    authClient = auth.client;
    testUserId = auth.userId;

    // Find a product to use in tests
    const productsRes = await rawGet("/api/products");
    const productsData = await productsRes.json();
    if (productsData.docs?.length > 0) {
      testProductId = productsData.docs[0].id;
    }

    // Clean up any existing wishlist items for this user before starting
    if (testUserId) {
      await cleanupByField("wishlists", "customer", testUserId);
    }
  });

  afterAll(async () => {
    if (testUserId) {
      await cleanupByField("wishlists", "customer", testUserId);
    }
  });

  describe("GET /api/wishlist (unauthenticated)", () => {
    test("returns 401 without authentication", async () => {
      const { response } = await api.GET("/api/wishlist");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/wishlist (authenticated)", () => {
    test("returns 200 with items array", async () => {
      const { response, data } = await authClient.GET("/api/wishlist");
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("items");
      expect(Array.isArray((data as ApiData).items)).toBe(true);
    });
  });

  describe("POST /api/wishlist", () => {
    test("returns 401 without authentication", async () => {
      const { response } = await api.POST("/api/wishlist", {
        body: { productId: 1 },
      });
      expect(response.status).toBe(401);
    });

    test("adds a product to the wishlist", async () => {
      if (!testProductId) {
        console.log("Skipping: no products available");
        return;
      }

      const { response, data } = await authClient.POST("/api/wishlist", {
        body: { productId: testProductId },
      });
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("item");
      const item = (data as ApiData)?.item as ApiData | undefined;
      wishlistItemId = item?.id != null ? (item.id as number) : null;
    });

    test("returns 409 when adding duplicate product", async () => {
      if (!testProductId) {
        console.log("Skipping: no products available");
        return;
      }

      const { response } = await authClient.POST("/api/wishlist", {
        body: { productId: testProductId },
      });
      expect(response.status).toBe(409);
    });
  });

  describe("GET /api/wishlist/check/{productId}", () => {
    test("returns inWishlist: true for added product", async () => {
      if (!testProductId) {
        console.log("Skipping: no products available");
        return;
      }

      const { response, data } = await authClient.GET(
        "/api/wishlist/check/{productId}",
        {
          params: { path: { productId: String(testProductId) } },
        },
      );
      expect(response.status).toBe(200);
      expect((data as ApiData).inWishlist).toBe(true);
      expect((data as ApiData).itemId).toBeDefined();
    });
  });

  describe("DELETE /api/wishlist/{itemId}", () => {
    test("removes item from wishlist", async () => {
      if (!wishlistItemId) {
        console.log("Skipping: no wishlist item created");
        return;
      }

      const { response, data } = await authClient.DELETE(
        "/api/wishlist/{itemId}",
        {
          params: { path: { itemId: String(wishlistItemId) } },
        },
      );
      expect(response.status).toBe(200);
      expect((data as ApiData).success).toBe(true);
    });

    test("check returns inWishlist: false after removal", async () => {
      if (!testProductId) {
        console.log("Skipping: no products available");
        return;
      }

      const { response, data } = await authClient.GET(
        "/api/wishlist/check/{productId}",
        {
          params: { path: { productId: String(testProductId) } },
        },
      );
      expect(response.status).toBe(200);
      expect((data as ApiData).inWishlist).toBe(false);
    });
  });
});
