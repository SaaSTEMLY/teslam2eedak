import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const SuggestQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Query prefix must not be empty")
    .max(200, "Query prefix must not exceed 200 characters")
    .describe("Prefix text for autocomplete suggestions"),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(10, "Limit must not exceed 10")
    .optional()
    .default(5)
    .describe("Maximum number of suggestions to return"),
});

export const SuggestionSchema = z.object({
  text: z.string().min(1).max(500).describe("Suggested search completion text"),
  score: z
    .number()
    .min(0)
    .max(1000)
    .optional()
    .describe("Relevance score of the suggestion"),
});

export const SuggestResponseSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .max(10)
    .describe("Autocomplete suggestion results"),
});

export const SuggestEmptyResponseSchema = z.object({
  suggestions: z
    .array(SuggestionSchema)
    .max(0)
    .describe("Empty suggestions when no query prefix provided"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const suggestRouteDoc: RouteDoc = {
  path: "/api/search/suggest",
  method: "get",
  summary: "Autocomplete search suggestions",
  description:
    "Returns prefix-based autocomplete suggestions from the SaaSignal search index. Use this to power a search-as-you-type UI. Returns an empty array when no prefix is provided.",
  tags: ["Search"],
  security: [],
  parameters: [
    {
      name: "q",
      in: "query",
      required: true,
      description: "Prefix text for autocomplete suggestions",
      schema: { type: "string", minLength: 1, maxLength: 200, example: "wire" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      description: "Maximum number of suggestions (default 5, max 10)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        default: 5,
        example: 5,
      },
    },
  ],
  responses: {
    "200": {
      description: "Autocomplete suggestions",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                maxItems: 10,
                description: "Autocomplete suggestion results",
                items: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description: "Suggested search completion text",
                      example: "wireless headphones",
                    },
                    score: {
                      type: "number",
                      description: "Relevance score",
                      example: 0.92,
                    },
                  },
                },
              },
            },
          },
          example: {
            suggestions: [
              { text: "wireless headphones", score: 0.92 },
              { text: "wireless charger", score: 0.87 },
              { text: "wireless mouse", score: 0.81 },
            ],
          },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Suggest failed" },
        },
      },
    },
  },
};
