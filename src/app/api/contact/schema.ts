import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

/** Safe character regex: letters, numbers, spaces, hyphens, apostrophes, periods. */
const safeNameRegex = /^[\p{L}\p{N}\s\-'.]+$/u;

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(150, "Name must be 150 characters or fewer")
    .regex(safeNameRegex, "Name contains invalid characters")
    .describe("Full name of the person submitting the form"),
  email: z
    .email("Invalid email address")
    .min(5, "Email is required")
    .max(320, "Email must be 320 characters or fewer")
    .describe("Contact email address"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be 200 characters or fewer")
    .describe("Subject line for the contact message"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message must be 5,000 characters or fewer")
    .describe("Body of the contact message"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const contactSuccessSchema = z.object({
  success: z.literal(true).describe("Indicates the submission was saved"),
});

// ---------------------------------------------------------------------------
// RouteDoc — POST /api/contact
// ---------------------------------------------------------------------------

export const contactPost: RouteDoc = {
  path: "/api/contact",
  method: "post",
  summary: "Submit contact form",
  description:
    "Accepts a contact form submission and stores it in the Payload CMS `contact-form-submissions` collection. No authentication is required.",
  tags: ["Contact"],
  security: [],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["name", "email", "subject", "message"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 150,
              pattern: "^[\\p{L}\\p{N}\\s\\-'.]+$",
              description: "Full name of the person submitting the form",
              example: "Jane Doe",
            },
            email: {
              type: "string",
              format: "email",
              minLength: 5,
              maxLength: 320,
              description: "Contact email address",
              example: "jane@example.com",
            },
            subject: {
              type: "string",
              minLength: 1,
              maxLength: 200,
              description: "Subject line for the contact message",
              example: "Partnership inquiry",
            },
            message: {
              type: "string",
              minLength: 1,
              maxLength: 5000,
              description: "Body of the contact message",
              example:
                "Hi, I would love to discuss a potential partnership. Please let me know a good time to connect.",
            },
          },
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Contact form submitted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                example: true,
                description: "Indicates the submission was saved",
              },
            },
          },
        },
      },
    },
    "400": {
      description: "Validation error — missing or invalid fields",
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
  "x-dashboard-trigger": "Payload Admin > Contact Form Submissions",
};
