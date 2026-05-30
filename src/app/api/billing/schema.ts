import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas — Shared
// ---------------------------------------------------------------------------

export const BillingAddressSchema = z.object({
  firstName: z
    .string()
    .min(0)
    .max(100)
    .optional()
    .describe("Billing first name"),
  lastName: z.string().min(0).max(100).optional().describe("Billing last name"),
  addressLine1: z
    .string()
    .min(0)
    .max(200)
    .optional()
    .describe("Street address line 1"),
  addressLine2: z
    .string()
    .min(0)
    .max(200)
    .optional()
    .describe("Street address line 2"),
  city: z.string().min(0).max(100).optional().describe("City"),
  state: z.string().min(0).max(100).optional().describe("State or province"),
  postalCode: z
    .string()
    .min(0)
    .max(20)
    .optional()
    .describe("Postal / ZIP code"),
  country: z
    .string()
    .min(0)
    .max(2)
    .optional()
    .describe("Two-letter ISO 3166-1 country code"),
});

// ---------------------------------------------------------------------------
// Zod Schemas — Actions
// ---------------------------------------------------------------------------

export const SetupIntentRequestSchema = z.object({
  action: z.literal("setup-intent").describe("Action identifier"),
  alias: z
    .string()
    .min(0)
    .max(100)
    .optional()
    .describe("Human-friendly label for the payment method"),
});

export const SetDefaultRequestSchema = z.object({
  action: z.literal("set-default").describe("Action identifier"),
  paymentMethodId: z
    .string()
    .min(1, "Payment method ID is required")
    .max(255)
    .describe("Stripe PaymentMethod ID to set as default"),
});

export const UpdateTransactionBillingRequestSchema = z.object({
  action: z.literal("update-transaction-billing").describe("Action identifier"),
  paymentIntentId: z
    .string()
    .min(1, "Payment intent ID is required")
    .max(255)
    .describe("Stripe PaymentIntent ID of the transaction to update"),
  billingAddress: BillingAddressSchema.describe(
    "Billing address fields to save",
  ),
});

export const UpdateMetadataRequestSchema = z.object({
  action: z.literal("update-metadata").describe("Action identifier"),
  paymentMethodId: z
    .string()
    .min(1, "Payment method ID is required")
    .max(255)
    .describe("Stripe PaymentMethod ID to update"),
  alias: z
    .string()
    .min(0)
    .max(100)
    .optional()
    .describe("Human-friendly label for the payment method"),
  billingAddress: BillingAddressSchema.optional().describe(
    "Billing address fields to store in metadata",
  ),
});

export const BillingPostRequestSchema = z.discriminatedUnion("action", [
  SetupIntentRequestSchema,
  SetDefaultRequestSchema,
  UpdateTransactionBillingRequestSchema,
  UpdateMetadataRequestSchema,
]);

export const BillingPostSuccessSchema = z.union([
  z.object({
    clientSecret: z
      .string()
      .min(1)
      .max(500)
      .describe("Stripe SetupIntent client secret for frontend confirmation"),
  }),
  z.object({
    success: z.literal(true).describe("Indicates the operation succeeded"),
  }),
]);

export const BillingErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const billingPostDoc: RouteDoc = {
  path: "/api/billing",
  method: "post",
  scope: "internal",
  summary: "Perform a billing action (setup, default, update)",
  description:
    "Handles multiple billing operations via the `action` field:\n\n- **`setup-intent`** — Creates a Stripe SetupIntent for adding a new card.\n- **`set-default`** — Sets a payment method as the customer's default.\n- **`update-transaction-billing`** — Updates the billing address on a Payload transaction.\n- **`update-metadata`** — Updates alias and billing address metadata on a Stripe PaymentMethod.\n\nAll actions require authentication.",
  tags: ["Billing"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          oneOf: [
            {
              type: "object",
              required: ["action"],
              properties: {
                action: {
                  type: "string",
                  enum: ["setup-intent"],
                  description: "Create a Stripe SetupIntent",
                },
                alias: {
                  type: "string",
                  minLength: 0,
                  maxLength: 100,
                  description: "Human-friendly label for the payment method",
                  example: "Personal Visa",
                },
              },
            },
            {
              type: "object",
              required: ["action", "paymentMethodId"],
              properties: {
                action: {
                  type: "string",
                  enum: ["set-default"],
                  description: "Set a payment method as default",
                },
                paymentMethodId: {
                  type: "string",
                  minLength: 1,
                  maxLength: 255,
                  description: "Stripe PaymentMethod ID",
                  example: "pm_1Oc0X2Abc123def456",
                },
              },
            },
            {
              type: "object",
              required: ["action", "paymentIntentId", "billingAddress"],
              properties: {
                action: {
                  type: "string",
                  enum: ["update-transaction-billing"],
                  description:
                    "Update billing address on a Payload transaction",
                },
                paymentIntentId: {
                  type: "string",
                  minLength: 1,
                  maxLength: 255,
                  description: "Stripe PaymentIntent ID",
                  example: "pi_3Oc0X2Abc123def456",
                },
                billingAddress: {
                  type: "object",
                  properties: {
                    firstName: {
                      type: "string",
                      maxLength: 100,
                      example: "Jane",
                    },
                    lastName: {
                      type: "string",
                      maxLength: 100,
                      example: "Doe",
                    },
                    addressLine1: {
                      type: "string",
                      maxLength: 200,
                      example: "123 Main St",
                    },
                    addressLine2: {
                      type: "string",
                      maxLength: 200,
                      example: "Apt 4B",
                    },
                    city: {
                      type: "string",
                      maxLength: 100,
                      example: "New York",
                    },
                    state: {
                      type: "string",
                      maxLength: 100,
                      example: "NY",
                    },
                    postalCode: {
                      type: "string",
                      maxLength: 20,
                      example: "10001",
                    },
                    country: {
                      type: "string",
                      maxLength: 2,
                      example: "US",
                    },
                  },
                },
              },
            },
            {
              type: "object",
              required: ["action", "paymentMethodId"],
              properties: {
                action: {
                  type: "string",
                  enum: ["update-metadata"],
                  description:
                    "Update alias and billing metadata on a payment method",
                },
                paymentMethodId: {
                  type: "string",
                  minLength: 1,
                  maxLength: 255,
                  description: "Stripe PaymentMethod ID",
                  example: "pm_1Oc0X2Abc123def456",
                },
                alias: {
                  type: "string",
                  maxLength: 100,
                  description: "Human-friendly label",
                  example: "Work Amex",
                },
                billingAddress: {
                  type: "object",
                  description: "Billing address fields to store in metadata",
                  properties: {
                    firstName: {
                      type: "string",
                      maxLength: 100,
                      example: "Jane",
                    },
                    lastName: {
                      type: "string",
                      maxLength: 100,
                      example: "Doe",
                    },
                    addressLine1: {
                      type: "string",
                      maxLength: 200,
                      example: "456 Oak Ave",
                    },
                    addressLine2: { type: "string", maxLength: 200 },
                    city: {
                      type: "string",
                      maxLength: 100,
                      example: "Chicago",
                    },
                    state: {
                      type: "string",
                      maxLength: 100,
                      example: "IL",
                    },
                    postalCode: {
                      type: "string",
                      maxLength: 20,
                      example: "60601",
                    },
                    country: {
                      type: "string",
                      maxLength: 2,
                      example: "US",
                    },
                  },
                },
              },
            },
          ],
          discriminator: { propertyName: "action" },
        },
        examples: {
          setupIntent: {
            summary: "Create a SetupIntent",
            value: { action: "setup-intent", alias: "Personal Visa" },
          },
          setDefault: {
            summary: "Set default payment method",
            value: {
              action: "set-default",
              paymentMethodId: "pm_1Oc0X2Abc123def456",
            },
          },
          updateTransactionBilling: {
            summary: "Update transaction billing address",
            value: {
              action: "update-transaction-billing",
              paymentIntentId: "pi_3Oc0X2Abc123def456",
              billingAddress: {
                firstName: "Jane",
                lastName: "Doe",
                addressLine1: "123 Main St",
                city: "New York",
                state: "NY",
                postalCode: "10001",
                country: "US",
              },
            },
          },
          updateMetadata: {
            summary: "Update payment method metadata",
            value: {
              action: "update-metadata",
              paymentMethodId: "pm_1Oc0X2Abc123def456",
              alias: "Work Amex",
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description:
        "Operation succeeded. Returns `clientSecret` for setup-intent or `{ success: true }` for other actions.",
      content: {
        "application/json": {
          schema: {
            oneOf: [
              {
                type: "object",
                required: ["clientSecret"],
                properties: {
                  clientSecret: {
                    type: "string",
                    description:
                      "Stripe SetupIntent client secret (setup-intent action only)",
                    example: "seti_1Oc0X2_secret_abc123",
                  },
                },
              },
              {
                type: "object",
                required: ["success"],
                properties: {
                  success: { type: "boolean", enum: [true], example: true },
                },
              },
            ],
          },
          examples: {
            setupIntent: {
              summary: "SetupIntent created",
              value: { clientSecret: "seti_1Oc0X2_secret_abc123" },
            },
            success: {
              summary: "Action completed",
              value: { success: true },
            },
          },
        },
      },
    },
    "400": {
      description: "Invalid action or missing required fields",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { error: "paymentMethodId is required" },
        },
      },
    },
    "401": {
      description: "Not authenticated",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Unauthorized" },
        },
      },
    },
    "403": {
      description: "Payment method does not belong to the authenticated user",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Not authorized" },
        },
      },
    },
    "404": {
      description: "User or transaction not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Transaction not found" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Billing operation failed" },
        },
      },
    },
  },
};
