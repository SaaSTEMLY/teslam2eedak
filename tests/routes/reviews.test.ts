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
let createdReviewId: number | null = null;

describe("Reviews API", () => {
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
  });

  afterAll(async () => {
    if (testUserId) {
      await cleanupByField("reviews", "customer", testUserId);
    }
  });

  describe("GET /api/reviews", () => {
    test("returns 200 with reviews for a valid productId", async () => {
      const { response, data } = await api.GET("/api/reviews", {
        params: { query: { productId: "1" } },
      });
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("reviews");
      expect(data).toHaveProperty("totalPages");
      expect(data).toHaveProperty("page");
      expect(data).toHaveProperty("totalDocs");
      expect(data).toHaveProperty("averageRating");
      expect(data).toHaveProperty("breakdown");
    });

    test("returns 400 when productId is missing", async () => {
      const { response } = await api.GET("/api/reviews", {
        params: { query: { productId: "" } },
      });
      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/reviews", () => {
    test("returns 401 without authentication", async () => {
      const { response } = await api.POST("/api/reviews", {
        body: {
          productId: 1,
          rating: 5,
          title: "Great product",
          body: "This is a test review",
        },
      });
      expect(response.status).toBe(401);
    });

    test("creates a review when authenticated", async () => {
      if (!testProductId) {
        console.log("Skipping: no products available");
        return;
      }

      const { response, data } = await authClient.POST("/api/reviews", {
        body: {
          productId: testProductId,
          rating: 4,
          title: "Integration test review",
          body: "This review was created by an integration test.",
        },
      });
      expect(response.status).toBe(201);
      expect(data).toHaveProperty("review");
      const review = (data as ApiData)?.review as ApiData | undefined;
      createdReviewId = review?.id != null ? (review.id as number) : null;
    });

    test("rejects duplicate review for same product", async () => {
      if (!testProductId || !createdReviewId) {
        console.log("Skipping: no product or no prior review");
        return;
      }

      const { response } = await authClient.POST("/api/reviews", {
        body: {
          productId: testProductId,
          rating: 3,
          title: "Duplicate review",
          body: "This should be rejected.",
        },
      });
      expect(response.status).toBe(409);
    });
  });

  describe("POST /api/reviews/{reviewId}/helpful", () => {
    test("returns 401 without authentication", async () => {
      // Use a dummy review ID — the 401 check happens before the lookup
      const { response } = await api.POST("/api/reviews/{reviewId}/helpful", {
        params: { path: { reviewId: "1" } },
      });
      expect(response.status).toBe(401);
    });

    test("marks a review as helpful when authenticated", async () => {
      if (!createdReviewId) {
        console.log("Skipping: no review created");
        return;
      }

      const { response, data } = await authClient.POST(
        "/api/reviews/{reviewId}/helpful",
        {
          params: { path: { reviewId: String(createdReviewId) } },
        },
      );
      expect(response.status).toBe(200);
      expect(data).toHaveProperty("helpfulCount");
      expect((data as ApiData).helpfulCount).toBeGreaterThanOrEqual(1);
    });
  });
});
