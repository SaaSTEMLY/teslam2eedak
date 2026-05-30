import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas — GET /api/reviews
// ---------------------------------------------------------------------------

export const reviewsQuerySchema = z.object({
  productId: z
    .string()
    .min(1, "productId is required")
    .max(20, "productId must be 20 characters or fewer")
    .describe("Numeric ID of the product to fetch reviews for"),
  page: z
    .string()
    .min(1)
    .max(10)
    .optional()
    .describe("Page number for pagination (defaults to 1)"),
  limit: z
    .string()
    .min(1)
    .max(3)
    .optional()
    .describe("Number of reviews per page (1-50, defaults to 10)"),
  sort: z
    .enum(["-createdAt", "helpful", "highest", "lowest"])
    .optional()
    .describe("Sort order for reviews (defaults to -createdAt)"),
});

export type ReviewsQueryInput = z.infer<typeof reviewsQuerySchema>;

export const ratingBreakdownSchema = z.object({
  "1": z.number().int().min(0).max(999999).describe("Count of 1-star reviews"),
  "2": z.number().int().min(0).max(999999).describe("Count of 2-star reviews"),
  "3": z.number().int().min(0).max(999999).describe("Count of 3-star reviews"),
  "4": z.number().int().min(0).max(999999).describe("Count of 4-star reviews"),
  "5": z.number().int().min(0).max(999999).describe("Count of 5-star reviews"),
});

export const reviewsGetResponseSchema = z.object({
  reviews: z
    .array(z.record(z.string(), z.unknown()))
    .max(50)
    .describe("Array of approved review documents"),
  totalPages: z
    .number()
    .int()
    .min(0)
    .max(999999)
    .describe("Total number of pages"),
  page: z.number().int().min(1).max(999999).describe("Current page number"),
  totalDocs: z
    .number()
    .int()
    .min(0)
    .max(999999)
    .describe("Total number of approved reviews"),
  averageRating: z
    .number()
    .min(0)
    .max(5)
    .describe("Average rating rounded to one decimal place"),
  breakdown: ratingBreakdownSchema.describe(
    "Count of reviews per star rating (1-5)",
  ),
});

// ---------------------------------------------------------------------------
// Zod Schemas — POST /api/reviews
// ---------------------------------------------------------------------------

export const createReviewSchema = z.object({
  productId: z
    .number()
    .int()
    .min(1, "productId must be a positive integer")
    .max(2147483647, "productId is out of range")
    .describe("Numeric ID of the product being reviewed"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .describe("Star rating from 1 to 5"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer")
    .describe("Short title for the review"),
  body: z
    .string()
    .min(1, "Review body is required")
    .max(5000, "Review body must be 5,000 characters or fewer")
    .describe("Full text of the review"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const createReviewResponseSchema = z.object({
  review: z
    .record(z.string(), z.unknown())
    .describe("The newly created review document"),
});

// ---------------------------------------------------------------------------
// RouteDoc — GET /api/reviews
// ---------------------------------------------------------------------------

export const reviewsGet: RouteDoc = {
  path: "/api/reviews",
  method: "get",
  summary: "List product reviews",
  description:
    "Returns a paginated list of approved reviews for a given product, along with aggregate statistics (average rating, star-rating breakdown).",
  tags: ["Reviews"],
  security: [],
  parameters: [
    {
      name: "productId",
      in: "query",
      required: true,
      description: "Numeric ID of the product to fetch reviews for",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 20,
        example: "42",
      },
    },
    {
      name: "page",
      in: "query",
      required: false,
      description: "Page number for pagination (defaults to 1)",
      schema: { type: "string", minLength: 1, maxLength: 10, example: "1" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      description: "Number of reviews per page (max 50, defaults to 10)",
      schema: { type: "string", minLength: 1, maxLength: 3, example: "10" },
    },
    {
      name: "sort",
      in: "query",
      required: false,
      description: "Sort order for reviews",
      schema: {
        type: "string",
        enum: ["-createdAt", "helpful", "highest", "lowest"],
        example: "-createdAt",
      },
    },
  ],
  responses: {
    "200": {
      description: "Paginated reviews with aggregate statistics",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              reviews: {
                type: "array",
                maxItems: 50,
                items: { type: "object" },
                description: "Array of approved review documents",
              },
              totalPages: {
                type: "integer",
                minimum: 0,
                description: "Total number of pages",
                example: 3,
              },
              page: {
                type: "integer",
                minimum: 1,
                description: "Current page number",
                example: 1,
              },
              totalDocs: {
                type: "integer",
                minimum: 0,
                description: "Total number of approved reviews",
                example: 28,
              },
              averageRating: {
                type: "number",
                minimum: 0,
                maximum: 5,
                description: "Average rating rounded to one decimal place",
                example: 4.3,
              },
              breakdown: {
                type: "object",
                description: "Count of reviews per star rating",
                properties: {
                  "1": { type: "integer", minimum: 0, example: 1 },
                  "2": { type: "integer", minimum: 0, example: 2 },
                  "3": { type: "integer", minimum: 0, example: 5 },
                  "4": { type: "integer", minimum: 0, example: 10 },
                  "5": { type: "integer", minimum: 0, example: 10 },
                },
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Validation error — missing productId",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
};

// ---------------------------------------------------------------------------
// RouteDoc — POST /api/reviews
// ---------------------------------------------------------------------------

export const reviewsPost: RouteDoc = {
  path: "/api/reviews",
  method: "post",
  summary: "Create a product review",
  description:
    "Creates a new review for a product. Requires authentication. The review is created with `pending` status and must be approved by an admin before it appears publicly. Duplicate reviews per user per product are rejected (409). Verified purchase status is automatically detected from order history.",
  tags: ["Reviews"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["productId", "rating", "title", "body"],
          properties: {
            productId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
              description: "Numeric ID of the product being reviewed",
              example: 42,
            },
            rating: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "Star rating from 1 to 5",
              example: 4,
            },
            title: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              description: "Short title for the review",
              example: "Great quality product",
            },
            body: {
              type: "string",
              minLength: 1,
              maxLength: 5000,
              description: "Full text of the review",
              example:
                "I have been using this for a month and the build quality is excellent. Highly recommended.",
            },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Review created successfully (status: pending)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              review: {
                type: "object",
                description: "The newly created review document",
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Validation error — missing or invalid fields",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
        },
      },
    },
    "401": {
      description: "Unauthorized — authentication required",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "404": {
      description: "Authenticated user not found in Payload users collection",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "409": {
      description: "Conflict — user has already reviewed this product",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
        },
      },
    },
  },
};
