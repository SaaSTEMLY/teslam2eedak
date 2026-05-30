import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const ValidateDiscountRequestSchema = z.object({
  code: z
    .string()
    .min(1, "Discount code is required")
    .max(50, "Discount code must be 50 characters or fewer")
    .describe("The discount code to validate"),
  customerEmail: z
    .string()
    .min(3)
    .max(320)
    .email("Must be a valid email address")
    .optional()
    .describe(
      "Customer email for per-customer usage limit checks. Optional for anonymous validation.",
    ),
  subtotal: z
    .number()
    .int()
    .min(0, "Subtotal cannot be negative")
    .max(99_999_999, "Subtotal exceeds maximum value")
    .optional()
    .describe(
      "Cart subtotal in cents. Used to check minimum order amount and calculate the discount.",
    ),
});

export const ValidateDiscountSuccessSchema = z.object({
  valid: z.literal(true).describe("Indicates the discount code is valid"),
  discountId: z
    .number()
    .int()
    .min(1)
    .max(2_147_483_647)
    .describe("Internal ID of the discount code record"),
  code: z.string().min(1).max(50).describe("The normalised discount code"),
  discountType: z
    .enum(["percentage", "flat"])
    .describe("Whether the discount is a percentage or a flat amount"),
  discountValue: z
    .number()
    .min(0)
    .max(1_000_000)
    .describe(
      "The discount value (percentage points for percentage type, cents for flat type)",
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
    .max(99_999_999)
    .describe(
      "Calculated discount amount in cents for the given subtotal (0 when subtotal is not provided)",
    ),
});

export const ValidateDiscountErrorSchema = z.object({
  valid: z.literal(false).describe("Indicates the discount code is invalid"),
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const validateDiscountDoc: RouteDoc = {
  path: "/api/discount/validate",
  method: "post",
  summary: "Validate a discount code",
  description:
    "Validates a discount code by checking whether it exists, is active, is within its valid date range, has not exceeded its usage limits, and meets minimum order requirements. Optionally calculates the discount amount when a subtotal is provided. Rate limited to 10 requests per IP per minute.",
  tags: ["Discounts"],
  security: [],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["code"],
          properties: {
            code: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              description: "The discount code to validate",
              example: "WELCOME10",
            },
            customerEmail: {
              type: "string",
              format: "email",
              minLength: 3,
              maxLength: 320,
              description: "Customer email for per-customer usage limit checks",
              example: "jane@example.com",
            },
            subtotal: {
              type: "integer",
              minimum: 0,
              maximum: 99999999,
              description:
                "Cart subtotal in cents for minimum order and discount calculation",
              example: 15000,
            },
          },
        },
        example: {
          code: "WELCOME10",
          customerEmail: "jane@example.com",
          subtotal: 15000,
        },
      },
    },
  },
  responses: {
    "200": {
      description:
        "Validation result. Both valid and invalid codes return 200; check the `valid` field.",
      content: {
        "application/json": {
          schema: {
            oneOf: [
              {
                type: "object",
                required: [
                  "valid",
                  "discountId",
                  "code",
                  "discountType",
                  "discountValue",
                  "maxDiscountAmount",
                  "discountAmount",
                ],
                properties: {
                  valid: { type: "boolean", enum: [true] },
                  discountId: {
                    type: "integer",
                    minimum: 1,
                    description: "Internal ID of the discount code record",
                    example: 3,
                  },
                  code: {
                    type: "string",
                    description: "The normalised discount code",
                    example: "WELCOME10",
                  },
                  discountType: {
                    type: "string",
                    enum: ["percentage", "flat"],
                    example: "percentage",
                  },
                  discountValue: {
                    type: "number",
                    minimum: 0,
                    description: "Discount value (percentage or cents)",
                    example: 10,
                  },
                  maxDiscountAmount: {
                    type: ["number", "null"],
                    minimum: 0,
                    description: "Maximum discount cap in cents",
                    example: null,
                  },
                  discountAmount: {
                    type: "number",
                    minimum: 0,
                    description: "Calculated discount amount in cents",
                    example: 1500,
                  },
                },
              },
              {
                type: "object",
                required: ["valid", "error"],
                properties: {
                  valid: { type: "boolean", enum: [false] },
                  error: {
                    type: "string",
                    description: "Human-readable error message",
                    example: "Invalid discount code",
                  },
                },
              },
            ],
          },
          examples: {
            valid: {
              summary: "Valid discount code",
              value: {
                valid: true,
                discountId: 3,
                code: "WELCOME10",
                discountType: "percentage",
                discountValue: 10,
                maxDiscountAmount: null,
                discountAmount: 1500,
              },
            },
            invalid: {
              summary: "Invalid discount code",
              value: {
                valid: false,
                error: "Invalid discount code",
              },
            },
            expired: {
              summary: "Expired discount code",
              value: {
                valid: false,
                error: "This discount code has expired",
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Missing or invalid request body",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { valid: false, error: "Discount code is required" },
        },
      },
    },
    "429": {
      description: "Rate limit exceeded (10 requests per minute per IP)",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: {
            valid: false,
            error: "Too many attempts. Please try again later.",
          },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: {
            valid: false,
            error: "Failed to validate discount code",
          },
        },
      },
    },
  },
  "x-rate-limit": { window: "60s", max: 10 },
};
