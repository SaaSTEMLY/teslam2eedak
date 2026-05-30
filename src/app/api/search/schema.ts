import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const SearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query must not be empty")
    .max(200, "Search query must not exceed 200 characters")
    .describe("Full-text search query"),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(20, "Limit must not exceed 20")
    .optional()
    .default(10)
    .describe("Maximum number of results per category to return"),
  locale: z
    .enum(["en", "ar", "es"])
    .optional()
    .default("en")
    .describe("Locale for blog content localization"),
});

export const ProductHitSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(100)
    .describe("Unique product identifier from the search index"),
  score: z
    .number()
    .min(0)
    .max(1000)
    .describe("Relevance score from the search engine"),
  document: z
    .object({
      name: z
        .string()
        .min(1)
        .max(500)
        .optional()
        .describe("Product display name"),
      slug: z
        .string()
        .min(1)
        .max(200)
        .optional()
        .describe("URL-safe product slug"),
      description: z
        .string()
        .min(0)
        .max(5000)
        .optional()
        .describe("Product description"),
      priceInUSD: z
        .number()
        .min(0)
        .max(1000000)
        .optional()
        .describe("Product price in US dollars"),
      category: z
        .string()
        .min(1)
        .max(200)
        .optional()
        .describe("Product category slug"),
      imageUrl: z
        .string()
        .min(1)
        .max(2048)
        .optional()
        .describe("URL of the product thumbnail image"),
    })
    .describe("Product metadata from the search index"),
});

export const BlogHitSchema = z.object({
  id: z.string().min(1).max(100).describe("Unique blog post identifier"),
  title: z.string().min(1).max(500).describe("Blog post title"),
  slug: z.string().min(1).max(200).describe("URL-safe blog post slug"),
  excerpt: z
    .string()
    .min(0)
    .max(1000)
    .optional()
    .describe("Short excerpt of the blog post"),
  category: z
    .string()
    .min(1)
    .max(200)
    .optional()
    .describe("Blog category identifier"),
  coverImageUrl: z
    .string()
    .min(1)
    .max(2048)
    .optional()
    .describe("URL of the cover image"),
});

export const SearchResponseSchema = z.object({
  hits: z
    .array(ProductHitSchema)
    .max(20)
    .describe("Product search results (alias for products)"),
  products: z
    .array(ProductHitSchema)
    .max(20)
    .describe("Product search results"),
  blogs: z.array(BlogHitSchema).max(5).describe("Blog post search results"),
});

export const SearchEmptyResponseSchema = z.object({
  products: z
    .array(ProductHitSchema)
    .max(0)
    .describe("Empty product results when no query provided"),
  blogs: z
    .array(BlogHitSchema)
    .max(0)
    .describe("Empty blog results when no query provided"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const searchRouteDoc: RouteDoc = {
  path: "/api/search",
  method: "get",
  summary: "Full-text search across products and blogs",
  description:
    "Searches for products using the SaaSignal search index and for blog posts using Payload CMS. Returns results from both collections. If no query is provided, returns empty arrays.",
  tags: ["Search"],
  security: [],
  parameters: [
    {
      name: "q",
      in: "query",
      required: true,
      description: "Full-text search query",
      schema: {
        type: "string",
        minLength: 1,
        maxLength: 200,
        example: "wireless headphones",
      },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      description:
        "Maximum number of results per category (default 10, max 20)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 20,
        default: 10,
        example: 10,
      },
    },
    {
      name: "locale",
      in: "query",
      required: false,
      description: "Locale for blog content localization",
      schema: {
        type: "string",
        enum: ["en", "ar", "es"],
        default: "en",
        example: "en",
      },
    },
  ],
  responses: {
    "200": {
      description: "Search results containing matched products and blog posts",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              hits: {
                type: "array",
                maxItems: 20,
                description: "Product search results (alias for products)",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "42" },
                    score: { type: "number", example: 0.95 },
                    document: {
                      type: "object",
                      properties: {
                        name: {
                          type: "string",
                          example: "Wireless Noise-Cancelling Headphones",
                        },
                        slug: {
                          type: "string",
                          example: "wireless-noise-cancelling-headphones",
                        },
                        description: {
                          type: "string",
                          example: "Premium over-ear headphones with ANC",
                        },
                        priceInUSD: { type: "number", example: 299.99 },
                        category: { type: "string", example: "electronics" },
                        imageUrl: {
                          type: "string",
                          example: "https://example.com/images/headphones.jpg",
                        },
                      },
                    },
                  },
                },
              },
              products: {
                type: "array",
                maxItems: 20,
                description: "Product search results",
                items: { $ref: "#/components/schemas/ProductHit" },
              },
              blogs: {
                type: "array",
                maxItems: 5,
                description: "Blog post search results",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "7" },
                    title: {
                      type: "string",
                      example: "Top 10 Wireless Headphones of 2026",
                    },
                    slug: {
                      type: "string",
                      example: "top-10-wireless-headphones-2026",
                    },
                    excerpt: {
                      type: "string",
                      example: "Discover the best wireless headphones...",
                    },
                    category: { type: "string", example: "reviews" },
                    coverImageUrl: {
                      type: "string",
                      example: "https://example.com/images/blog-cover.jpg",
                    },
                  },
                },
              },
            },
          },
          example: {
            hits: [
              {
                id: "42",
                score: 0.95,
                document: {
                  name: "Wireless Noise-Cancelling Headphones",
                  slug: "wireless-noise-cancelling-headphones",
                  priceInUSD: 299.99,
                  category: "electronics",
                },
              },
            ],
            products: [
              {
                id: "42",
                score: 0.95,
                document: {
                  name: "Wireless Noise-Cancelling Headphones",
                  slug: "wireless-noise-cancelling-headphones",
                  priceInUSD: 299.99,
                  category: "electronics",
                },
              },
            ],
            blogs: [
              {
                id: "7",
                title: "Top 10 Wireless Headphones of 2026",
                slug: "top-10-wireless-headphones-2026",
                excerpt: "Discover the best wireless headphones...",
                category: "reviews",
              },
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
          example: { error: "Search failed" },
        },
      },
    },
  },
};
