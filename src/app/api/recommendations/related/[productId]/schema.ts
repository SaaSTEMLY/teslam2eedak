import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const RelatedProductsParamsSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .max(20, "Product ID must not exceed 20 characters")
    .describe("The numeric ID of the product to find related products for"),
});

export const RelatedProductsQuerySchema = z.object({
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(12, "Limit must not exceed 12")
    .optional()
    .default(6)
    .describe("Maximum number of related products to return"),
  locale: z
    .enum(["en", "ar", "es"])
    .optional()
    .default("en")
    .describe("Locale for product content localization"),
});

export const RelatedProductSchema = z.object({
  id: z
    .number()
    .int()
    .min(1)
    .max(2147483647)
    .describe("Unique product identifier"),
  name: z.string().min(1).max(500).optional().describe("Product display name"),
  slug: z.string().min(1).max(200).optional().describe("URL-safe product slug"),
  priceInUSD: z
    .number()
    .min(0)
    .max(1000000)
    .optional()
    .describe("Product price in US dollars"),
  category: z.string().min(1).max(200).optional().describe("Product category"),
});

export const RelatedProductsResponseSchema = z.object({
  products: z
    .array(RelatedProductSchema)
    .max(12)
    .describe("List of related products"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const relatedProductsRouteDoc: RouteDoc = {
  path: "/api/recommendations/related/{productId}",
  method: "get",
  summary: "Get related products",
  description:
    "Returns products related to the specified product using the SaaSignal ranking engine. Falls back to same-category products sorted by creation date if no ranking data is available yet.",
  tags: ["Recommendations"],
  security: [],
  parameters: [
    {
      name: "productId",
      in: "path",
      required: true,
      description: "The numeric ID of the product to find related products for",
      schema: { type: "string", minLength: 1, maxLength: 20, example: "42" },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      description: "Maximum number of related products (default 6, max 12)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 12,
        default: 6,
        example: 6,
      },
    },
    {
      name: "locale",
      in: "query",
      required: false,
      description: "Locale for product content localization",
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
      description: "Related products list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                maxItems: 12,
                description: "List of related products",
                items: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      description: "Unique product identifier",
                      example: 15,
                    },
                    name: {
                      type: "string",
                      description: "Product display name",
                      example: "Bluetooth Speaker",
                    },
                    slug: {
                      type: "string",
                      description: "URL-safe product slug",
                      example: "bluetooth-speaker",
                    },
                    priceInUSD: {
                      type: "number",
                      description: "Price in US dollars",
                      example: 79.99,
                    },
                    category: {
                      type: "string",
                      description: "Product category",
                      example: "electronics",
                    },
                  },
                },
              },
            },
          },
          example: {
            products: [
              {
                id: 15,
                name: "Bluetooth Speaker",
                slug: "bluetooth-speaker",
                priceInUSD: 79.99,
                category: "electronics",
              },
              {
                id: 23,
                name: "USB-C Audio Adapter",
                slug: "usb-c-audio-adapter",
                priceInUSD: 19.99,
                category: "electronics",
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
          example: { error: "Failed to fetch related products" },
        },
      },
    },
  },
};
