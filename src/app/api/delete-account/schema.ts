import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const DeleteAccountRequestSchema = z.object({
  token: z
    .string()
    .min(1, "Token is required")
    .max(512, "Token is too long")
    .describe(
      "The account-deletion verification token sent to the user's email",
    ),
});

export const DeleteAccountSuccessSchema = z.object({
  success: z.literal(true).describe("Indicates the account was deleted"),
});

export const DeleteAccountErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const deleteAccountDoc: RouteDoc = {
  path: "/api/delete-account",
  method: "post",
  scope: "internal",
  summary: "Confirm and execute account deletion",
  description:
    "Verifies the account-deletion token (sent via email) and permanently deletes the user account. This triggers Stripe customer cleanup and order anonymisation via Payload hooks. The verification token is consumed after successful deletion.",
  tags: ["Account"],
  security: [{ cookieAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              minLength: 1,
              maxLength: 512,
              description:
                "The account-deletion verification token sent to the user's email",
              example: "c3f8a2b1-d4e5-6789-abcd-0123456789ef",
            },
          },
        },
        example: {
          token: "c3f8a2b1-d4e5-6789-abcd-0123456789ef",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Account deleted successfully",
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
      description: "Missing, invalid, or expired token",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          examples: {
            missing: {
              summary: "Missing token",
              value: { error: "Missing or invalid token" },
            },
            invalid: {
              summary: "Invalid token",
              value: { error: "Invalid or expired token" },
            },
            expired: {
              summary: "Expired token",
              value: { error: "Token has expired" },
            },
          },
        },
      },
    },
    "404": {
      description: "User not found",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "User not found" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Failed to delete account" },
        },
      },
    },
  },
};
