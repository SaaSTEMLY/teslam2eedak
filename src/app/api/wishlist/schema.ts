import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas — GET /api/wishlist
// ---------------------------------------------------------------------------

export const wishlistGetResponseSchema = z.object({
  items: z
    .array(z.record(z.string(), z.unknown()))
    .max(50)
    .describe(
      "Array of wishlist item documents (depth 2 — includes product and variant relations)",
    ),
});

export type WishlistGetResponse = z.infer<typeof wishlistGetResponseSchema>;

// ---------------------------------------------------------------------------
// Zod Schemas — POST /api/wishlist
// ---------------------------------------------------------------------------

export const addToWishlistSchema = z.object({
  productId: z
    .number()
    .int()
    .min(1, "productId must be a positive integer")
    .max(2147483647, "productId is out of range")
    .describe("Numeric ID of the product to add to the wishlist"),
  variantId: z
    .number()
    .int()
    .min(1, "variantId must be a positive integer")
    .max(2147483647, "variantId is out of range")
    .optional()
    .describe("Optional numeric ID of a specific product variant"),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistSchema>;

export const addToWishlistResponseSchema = z.object({
  item: z
    .record(z.string(), z.unknown())
    .describe("The newly created wishlist item document"),
});

export type AddToWishlistResponse = z.infer<typeof addToWishlistResponseSchema>;

// ---------------------------------------------------------------------------
// RouteDoc — GET /api/wishlist
// ---------------------------------------------------------------------------

export const wishlistGet: RouteDoc = {
  path: "/api/wishlist",
  method: "get",
  summary: "Get user wishlist",
  description:
    "Returns all wishlist items for the authenticated user, sorted by most recently added. Each item includes full product and variant relations (depth 2). Limited to 50 items.",
  tags: ["Wishlist"],
  security: [{ cookieAuth: [] }],
  responses: {
    "200": {
      description: "Wishlist items retrieved successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                maxItems: 50,
                items: { type: "object" },
                description:
                  "Array of wishlist item documents with populated product/variant relations",
              },
            },
          },
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
// RouteDoc — POST /api/wishlist
// ---------------------------------------------------------------------------

export const wishlistPost: RouteDoc = {
  path: "/api/wishlist",
  method: "post",
  summary: "Add item to wishlist",
  description:
    "Adds a product (and optionally a specific variant) to the authenticated user's wishlist. Returns 409 if the product is already in the wishlist.",
  tags: ["Wishlist"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["productId"],
          properties: {
            productId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
              description: "Numeric ID of the product to add to the wishlist",
              example: 42,
            },
            variantId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
              description: "Optional numeric ID of a specific product variant",
              example: 7,
            },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Item added to wishlist",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              item: {
                type: "object",
                description: "The newly created wishlist item document",
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
      description: "Conflict — product is already in the wishlist",
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
