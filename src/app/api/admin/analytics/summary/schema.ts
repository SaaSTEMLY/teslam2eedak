import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const AnalyticsSummaryResponseSchema = z.object({
  totalRevenue: z
    .number()
    .min(0)
    .max(999999999)
    .describe("Total revenue in cents across all orders"),
  orderCount: z
    .number()
    .int()
    .min(0)
    .max(999999999)
    .describe("Total number of completed orders"),
  averageOrderValue: z
    .number()
    .min(0)
    .max(999999999)
    .describe(
      "Average order value (totalRevenue / orderCount), rounded to nearest integer",
    ),
  customerCount: z
    .number()
    .int()
    .min(0)
    .max(999999999)
    .describe("Total number of registered customers"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const analyticsSummaryRouteDoc: RouteDoc = {
  path: "/api/admin/analytics/summary",
  method: "get",
  scope: "internal",
  summary: "Get analytics summary",
  description:
    "Returns a high-level analytics overview including total revenue, order count, average order value, and customer count. Requires admin authentication.",
  tags: ["Admin", "Analytics"],
  security: [{ cookieAuth: [] }],
  responses: {
    "200": {
      description: "Analytics summary data",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              totalRevenue: {
                type: "number",
                description: "Total revenue in cents across all orders",
                example: 1250000,
              },
              orderCount: {
                type: "integer",
                description: "Total number of completed orders",
                example: 347,
              },
              averageOrderValue: {
                type: "integer",
                description:
                  "Average order value (totalRevenue / orderCount), rounded",
                example: 3602,
              },
              customerCount: {
                type: "integer",
                description: "Total number of registered customers",
                example: 1204,
              },
            },
          },
          example: {
            totalRevenue: 1250000,
            orderCount: 347,
            averageOrderValue: 3602,
            customerCount: 1204,
          },
        },
      },
    },
    "403": {
      description: "Forbidden — user is not an admin",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Forbidden" },
        },
      },
    },
    "500": {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Failed to load analytics" },
        },
      },
    },
  },
};
