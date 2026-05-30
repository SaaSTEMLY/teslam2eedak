import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const ApplyDiscountRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Discount code is required")
    .max(50, "Discount code must be 50 characters or fewer")
    .describe("The discount code to apply to the cart"),
  cartId: z
    .number()
    .int()
    .min(1, "Cart ID must be a positive integer")
    .max(2_147_483_647, "Cart ID exceeds maximum value")
    .describe("The ID of the cart to apply the discount to"),
  secret: z
    .string()
    .min(1)
    .max(255)
    .optional()
    .describe(
      "Cart secret for guest users who are not authenticated but own the cart",
    ),
});

export const ApplyDiscountSuccessSchema = z.object({
  success: z.literal(true).describe("Indicates the operation succeeded"),
  discount: z
    .object({
      discountId: z
        .number()
        .int()
        .min(1)
        .max(2_147_483_647)
        .describe("The internal ID of the discount code record"),
      code: z.string().min(1).max(50).describe("The normalised discount code"),
      discountType: z
        .enum(["percentage", "flat"])
        .describe("Whether the discount is a percentage or flat amount"),
      discountValue: z
        .number()
        .min(0)
        .max(1_000_000)
        .describe(
          "The discount value (percentage points or cents depending on type)",
        ),
      maxDiscountAmount: z
        .number()
        .min(0)
        .max(1_000_000)
        .nullable()
        .describe("Maximum discount cap in cents (percentage type only)"),
      discountAmount: z
        .number()
        .min(0)
        .max(1_000_000)
        .describe("Calculated discount amount in cents for the current cart"),
    })
    .describe("Details of the applied discount"),
});

export const ApplyDiscountErrorSchema = z.object({
  success: z.literal(false).describe("Indicates the operation failed"),
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const applyDiscountDoc: RouteDoc = {
  path: "/api/cart/apply-discount",
  method: "post",
  summary: "Apply a discount code to a cart",
  description:
    "Validates and applies a discount code to the specified cart. The caller must own the cart (via session) or provide the cart secret. The discount is validated against the `/api/discount/validate` endpoint before being persisted.",
  tags: ["Cart"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["code", "cartId"],
          properties: {
            code: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              description: "The discount code to apply to the cart",
              example: "SAVE20",
            },
            cartId: {
              type: "integer",
              minimum: 1,
              maximum: 2147483647,
              description: "The ID of the cart to apply the discount to",
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
          code: "SAVE20",
          cartId: 42,
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Discount applied successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["success", "discount"],
            properties: {
              success: { type: "boolean", enum: [true], example: true },
              discount: {
                type: "object",
                required: [
                  "discountId",
                  "code",
                  "discountType",
                  "discountValue",
                  "maxDiscountAmount",
                  "discountAmount",
                ],
                properties: {
                  discountId: {
                    type: "integer",
                    minimum: 1,
                    description: "The internal ID of the discount code record",
                    example: 7,
                  },
                  code: {
                    type: "string",
                    description: "The normalised discount code",
                    example: "SAVE20",
                  },
                  discountType: {
                    type: "string",
                    enum: ["percentage", "flat"],
                    description:
                      "Whether the discount is a percentage or flat amount",
                    example: "percentage",
                  },
                  discountValue: {
                    type: "number",
                    minimum: 0,
                    description:
                      "The discount value (percentage points or cents)",
                    example: 20,
                  },
                  maxDiscountAmount: {
                    type: ["number", "null"],
                    minimum: 0,
                    description:
                      "Maximum discount cap in cents (percentage type only)",
                    example: 5000,
                  },
                  discountAmount: {
                    type: "number",
                    minimum: 0,
                    description:
                      "Calculated discount amount in cents for the current cart",
                    example: 2000,
                  },
                },
              },
            },
          },
          example: {
            success: true,
            discount: {
              discountId: 7,
              code: "SAVE20",
              discountType: "percentage",
              discountValue: 20,
              maxDiscountAmount: 5000,
              discountAmount: 2000,
            },
          },
        },
      },
    },
    "400": {
      description: "Validation error or invalid discount code",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { success: false, error: "Discount code is required" },
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
          example: { success: false, error: "Failed to apply discount" },
        },
      },
    },
  },
  "x-dashboard-trigger":
    "Use from the cart page by entering a discount code and clicking Apply.",
};
