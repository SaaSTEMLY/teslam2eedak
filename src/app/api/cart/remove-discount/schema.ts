import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const RemoveDiscountRequestSchema = z.object({
  cartId: z
    .number()
    .int()
    .min(1, "Cart ID must be a positive integer")
    .max(2_147_483_647, "Cart ID exceeds maximum value")
    .describe("The ID of the cart to remove the discount from"),
  secret: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe(
      "Cart secret for guest users who are not authenticated but own the cart",
    ),
});

export const RemoveDiscountSuccessSchema = z.object({
  success: z.literal(true).describe("Indicates the operation succeeded"),
});

export const RemoveDiscountErrorSchema = z.object({
  success: z.literal(false).describe("Indicates the operation failed"),
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const removeDiscountDoc: RouteDoc = {
  path: "/api/cart/remove-discount",
  method: "post",
  summary: "Remove a discount code from a cart",
  description:
    "Removes any previously applied discount code from the specified cart. The caller must own the cart (via session) or provide the cart secret.",
  tags: ["Cart"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["cartId"],
          properties: {
            cartId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
              description: "The ID of the cart to remove the discount from",
              example: 42,
            },
            secret: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description:
                "Cart secret for guest users who are not authenticated but own the cart",
              example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            },
          },
        },
        example: {
          cartId: 42,
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Discount removed successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["success"],
            properties: {
              success: { type: "boolean", enum: [true], example: true },
            },
          },
          example: { success: true },
        },
      },
    },
    "400": {
      description: "Missing or invalid cart ID",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { success: false, error: "Cart ID is required" },
        },
      },
    },
    "403": {
      description: "Not authorised to modify this cart",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { success: false, error: "Not authorized" },
        },
      },
    },
    "404": {
      description: "Cart not found or already purchased",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { success: false, error: "Cart not found" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { success: false, error: "Failed to remove discount" },
        },
      },
    },
  },
  "x-dashboard-trigger":
    "Use from the cart page by clicking the remove discount button next to the applied code.",
};
