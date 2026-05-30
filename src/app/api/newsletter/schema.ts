import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const newsletterSubscribeSchema = z.object({
  email: z
    .email("Invalid email address")
    .min(5, "Email is required")
    .max(320, "Email must be 320 characters or fewer")
    .describe("Email address to subscribe to the newsletter"),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeSchema
>;

export const newsletterSuccessSchema = z.object({
  success: z.literal(true).describe("Indicates the subscription was recorded"),
});

// ---------------------------------------------------------------------------
// RouteDoc — POST /api/newsletter
// ---------------------------------------------------------------------------

export const newsletterPost: RouteDoc = {
  path: "/api/newsletter",
  method: "post",
  summary: "Subscribe to newsletter",
  description:
    "Subscribes an email address to the newsletter. The address is stored in the Payload CMS `newsletter-subscribers` collection and optionally synced to a Resend audience when `RESEND_API_KEY` and `RESEND_AUDIENCE_ID` are configured. Duplicate emails are silently ignored.",
  tags: ["Newsletter"],
  security: [],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              minLength: 5,
              maxLength: 320,
              description: "Email address to subscribe to the newsletter",
              example: "subscriber@example.com",
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Successfully subscribed (or already subscribed)",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Indicates the subscription was recorded",
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Validation error — invalid email address",
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
  "x-dashboard-trigger": "Payload Admin > Newsletter Subscribers",
};
