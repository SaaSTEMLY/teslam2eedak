import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

export const OrdersQuerySchema = z.object({
  page: z
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .max(10_000, "Page exceeds maximum value")
    .optional()
    .default(1)
    .describe("Page number for pagination"),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Maximum 50 items per page")
    .optional()
    .default(10)
    .describe("Number of orders per page (max 50)"),
});

export const OrdersSuccessSchema = z.object({
  orders: z
    .array(z.record(z.string(), z.unknown()))
    .max(50)
    .describe("Array of order objects with full depth-2 relations"),
  totalPages: z
    .number()
    .int()
    .min(0)
    .max(100_000)
    .describe("Total number of pages available"),
  page: z.number().int().min(1).max(10_000).describe("Current page number"),
  totalDocs: z
    .number()
    .int()
    .min(0)
    .max(10_000_000)
    .optional()
    .describe("Total number of orders matching the query"),
});

export const OrdersErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Human-readable error message"),
});

// ---------------------------------------------------------------------------
// RouteDoc
// ---------------------------------------------------------------------------

export const ordersDoc: RouteDoc = {
  path: "/api/orders",
  method: "get",
  summary: "List the authenticated user's orders",
  description:
    "Returns a paginated list of orders belonging to the authenticated user. Orders are matched by the internal user ID or the user's email and are sorted by creation date (newest first).",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: "page",
      in: "query",
      required: false,
      description: "Page number for pagination (defaults to 1)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 10000,
        default: 1,
        example: 1,
      },
    },
    {
      name: "limit",
      in: "query",
      required: false,
      description: "Number of orders per page (defaults to 10, max 50)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 50,
        default: 10,
        example: 10,
      },
    },
  ],
  responses: {
    "200": {
      description: "Paginated order list",
      content: {
        "application/json": {
          schema: {
            type: "object",
            required: ["orders", "totalPages", "page"],
            properties: {
              orders: {
                type: "array",
                maxItems: 50,
                items: {
                  type: "object",
                  description:
                    "Order object with depth-2 relations (customer, products, etc.)",
                },
                description: "Array of order objects",
              },
              totalPages: {
                type: "integer",
                minimum: 0,
                description: "Total number of pages",
                example: 3,
              },
              page: {
                type: "integer",
                minimum: 1,
                description: "Current page number",
                example: 1,
              },
              totalDocs: {
                type: "integer",
                minimum: 0,
                description: "Total number of orders",
                example: 27,
              },
            },
          },
          example: {
            orders: [],
            totalPages: 3,
            page: 1,
            totalDocs: 27,
          },
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
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Failed to load orders" },
        },
      },
    },
  },
};
