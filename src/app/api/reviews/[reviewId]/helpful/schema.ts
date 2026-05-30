import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const reviewIdParamSchema = z.object({
  reviewId: z
    .string()
    .min(1, "reviewId is required")
    .max(20, "reviewId must be 20 characters or fewer")
    .describe("Numeric ID of the review to mark as helpful"),
});

export type ReviewIdParam = z.infer<typeof reviewIdParamSchema>;

export const helpfulResponseSchema = z.object({
  helpfulCount: z
    .number()
    .int()
    .min(0)
    .max(2147483647)
    .describe("Updated helpful vote count for the review"),
});

export type HelpfulResponse = z.infer<typeof helpfulResponseSchema>;

// ---------------------------------------------------------------------------
// RouteDoc — POST /api/reviews/{reviewId}/helpful
// ---------------------------------------------------------------------------

export const reviewHelpfulPost: RouteDoc = {
  path: "/api/reviews/{reviewId}/helpful",
  method: "post",
  summary: "Mark a review as helpful",
  description:
    "Increments the helpful vote count on a review. Requires authentication. The review must exist; otherwise a 404 is returned.",
  tags: ["Reviews"],
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: "reviewId",
      in: "path",
      required: true,
      description: "Numeric ID of the review to mark as helpful",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 20,
        example: "17",
      },
    },
  ],
  responses: {
    "200": {
      description: "Helpful count incremented successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              helpfulCount: {
                type: "integer",
                minimum: 0,
                description: "Updated helpful vote count",
                example: 5,
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
    "404": {
      description: "Review not found",
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
