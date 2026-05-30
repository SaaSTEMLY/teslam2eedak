import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const AvatarQuerySchema = z.object({
  seed: z
    .string()
    .min(1, "Seed parameter is required")
    .max(200, "Seed is too long")
    .describe(
      "Seed string used to deterministically generate the avatar (e.g. user ID, email, or username)",
    ),
});

export const AvatarErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const avatarDoc: RouteDoc = {
  path: "/api/avatar",
  method: "get",
  scope: "internal",
  summary: "Generate a deterministic SVG avatar",
  description:
    "Generates a unique Notionists-style SVG avatar based on the provided seed string. The same seed always produces the same avatar. The response is an `image/svg+xml` document with aggressive caching headers (`public, max-age=31536000, immutable`). This is a **public** endpoint — no authentication required.",
  tags: ["Account"],
  security: [],
  parameters: [
    {
      name: "seed",
      in: "query",
      required: true,
      description:
        "Seed string for deterministic avatar generation (e.g. user ID, email, or username)",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        example: "jane-doe-42",
      },
    },
  ],
  responses: {
    "200": {
      description: "SVG avatar image",
      content: {
        "image/svg+xml": {
          schema: {
            type: "string",
            description: "SVG document as a string",
          },
          example:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">...</svg>',
        },
      },
    },
    "400": {
      description: "Missing seed parameter",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { error: "Missing seed parameter" },
        },
      },
    },
  },
};
