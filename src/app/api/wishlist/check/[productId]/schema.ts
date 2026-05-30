import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const wishlistCheckParamSchema = z.object({
  productId: z
    .string()
    .min(1, "productId is required")
    .max(20, "productId must be 20 characters or fewer")
    .describe("Numeric ID of the product to check"),
});

export type WishlistCheckParam = z.infer<typeof wishlistCheckParamSchema>;

export const wishlistCheckResponseSchema = z.object({
  inWishlist: z
    .boolean()
    .describe("Whether the product is in the user's wishlist"),
  itemId: z
    .union([
      z
        .number()
        .int()
        .min(1)
        .max(2147483647)
        .describe("ID of the matching wishlist item"),
      z.null(),
    ])
    .describe(
      "ID of the matching wishlist item, or null if not in the wishlist",
    ),
});

export type WishlistCheckResponse = z.infer<typeof wishlistCheckResponseSchema>;

// ---------------------------------------------------------------------------
// RouteDoc — GET /api/wishlist/check/{productId}
// ---------------------------------------------------------------------------

export const wishlistCheckGet: RouteDoc = {
  path: "/api/wishlist/check/{productId}",
  method: "get",
  summary: "Check if product is in wishlist",
  description:
    "Checks whether a specific product is in the authenticated user's wishlist. If the user is not authenticated or not found, returns `{ inWishlist: false }` without an error. When the product is found in the wishlist, the response includes the `itemId` for convenient removal.",
  tags: ["Wishlist"],
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: "productId",
      in: "path",
      required: true,
      description: "Numeric ID of the product to check",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 20,
        example: "42",
      },
    },
  ],
  responses: {
    "200": {
      description: "Wishlist check result",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              inWishlist: {
                type: "boolean",
                description: "Whether the product is in the user's wishlist",
                example: true,
              },
              itemId: {
                oneOf: [
                  {
                    type: "integer",
                    minimum: 1,
                    description: "ID of the matching wishlist item",
                    example: 123,
                  },
                  { type: "null" },
                ],
                description:
                  "ID of the matching wishlist item, or null if not in the wishlist",
              },
            },
          },
        },
      },
    },
  },
};
