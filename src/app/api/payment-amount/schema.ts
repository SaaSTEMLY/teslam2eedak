import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const PaymentAmountRequestSchema = z.object({
  paymentIntentId: z
    .string()
    .min(1, "Payment intent ID is required")
    .max(255, "Payment intent ID is too long")
    .describe("The Stripe PaymentIntent ID to calculate the amount for"),
  discountCode: z
    .string()
    .min(1)
    .max(50)
    .optional()
    .describe("Optional discount code to apply to the payment"),
});

export const PaymentAmountSuccessSchema = z.object({
  amount: z
    .number()
    .int()
    .min(0)
    .max(99_999_999)
    .describe("Final payment amount in cents after any discount"),
  currency: z.string().min(3).max(3).describe("Three-letter ISO currency code"),
  discountAmount: z
    .number()
    .int()
    .min(0)
    .max(99_999_999)
    .describe("Discount amount in cents (0 when no discount is applied)"),
});

export const PaymentAmountErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Human-readable error message"),
  amount: z
    .number()
    .int()
    .min(0)
    .max(99_999_999)
    .optional()
    .describe("Original payment amount in cents (returned on some errors)"),
  currency: z
    .string()
    .min(3)
    .max(3)
    .optional()
    .describe("Three-letter ISO currency code (returned on some errors)"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const paymentAmountDoc: RouteDoc = {
  path: "/api/payment-amount",
  method: "post",
  summary: "Calculate final payment amount with optional discount",
  description:
    "Retrieves the current amount of a Stripe PaymentIntent and optionally applies a discount code. The PaymentIntent must still be in the `requires_payment_method` status. For authenticated users, ownership is verified via the Stripe customer. For guests, the PaymentIntent ID acts as authorization. Rate limited to 20 requests per IP per minute.",
  tags: ["Payments"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["paymentIntentId"],
          properties: {
            paymentIntentId: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "The Stripe PaymentIntent ID",
              example: "pi_3Oc0X2Abc123def456",
            },
            discountCode: {
              type: "string",
              minLength: 1,
              maxLength: 50,
              description: "Optional discount code to apply to the payment",
              example: "SAVE20",
            },
          },
        },
        example: {
          paymentIntentId: "pi_3Oc0X2Abc123def456",
          discountCode: "SAVE20",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Payment amount calculated successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["amount", "currency", "discountAmount"],
            properties: {
              amount: {
                type: "integer",
                minimum: 0,
                description: "Final payment amount in cents after any discount",
                example: 8000,
              },
              currency: {
                type: "string",
                minLength: 3,
                maxLength: 3,
                description: "Three-letter ISO currency code",
                example: "usd",
              },
              discountAmount: {
                type: "integer",
                minimum: 0,
                description: "Discount amount in cents",
                example: 2000,
              },
            },
          },
          example: {
            amount: 8000,
            currency: "usd",
            discountAmount: 2000,
          },
        },
      },
    },
    "400": {
      description:
        "Missing paymentIntentId, invalid payment state, or discount error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          examples: {
            missingId: {
              summary: "Missing payment intent ID",
              value: { error: "paymentIntentId is required" },
            },
            alreadyInitiated: {
              summary: "Payment already in progress",
              value: {
                error:
                  "Cannot modify payment amount after payment has been initiated",
                amount: 10000,
                currency: "usd",
              },
            },
          },
        },
      },
    },
    "403": {
      description: "PaymentIntent does not belong to the authenticated user",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Not authorized" },
        },
      },
    },
    "429": {
      description: "Rate limit exceeded (20 requests per minute per IP)",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: {
            error: "Too many requests. Please try again later.",
          },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Failed to retrieve payment amount" },
        },
      },
    },
  },
  "x-rate-limit": { window: "60s", max: 20 },
};
