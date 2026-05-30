import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const wishlistItemIdParamSchema = z.object({
  itemId: z
    .string()
    .min(1, "itemId is required")
    .max(20, "itemId must be 20 characters or fewer")
    .describe("Numeric ID of the wishlist item to remove"),
});

export type WishlistItemIdParam = z.infer<typeof wishlistItemIdParamSchema>;

export const wishlistDeleteResponseSchema = z.object({
  success: z.literal(true).describe("Indicates the item was removed"),
});

export type WishlistDeleteResponse = z.infer<
  typeof wishlistDeleteResponseSchema
>;

// ---------------------------------------------------------------------------
// RouteDoc — DELETE /api/wishlist/{itemId}
// ---------------------------------------------------------------------------

export const wishlistItemDelete: RouteDoc = {
  path: "/api/wishlist/{itemId}",
  method: "delete",
  summary: "Remove item from wishlist",
  description:
    "Deletes a specific wishlist item by its ID. Requires authentication and ownership verification — users can only remove their own wishlist items. Returns 403 if the item belongs to another user.",
  tags: ["Wishlist"],
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: "itemId",
      in: "path",
      required: true,
      description: "Numeric ID of the wishlist item to remove",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 20,
        example: "123",
      },
    },
  ],
  responses: {
    "200": {
      description: "Wishlist item removed successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Indicates the item was removed",
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
    "403": {
      description: "Forbidden — wishlist item belongs to another user",
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
