import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const RevenueQuerySchema = z.object({
  days: z
    .number()
    .int()
    .min(1, "Days must be at least 1")
    .max(365, "Days must not exceed 365")
    .optional()
    .default(30)
    .describe("Number of days to look back for revenue data"),
});

export const RevenueDaySchema = z.object({
  date: z
    .string()
    .min(10, "Date must be in YYYY-MM-DD format")
    .max(10, "Date must be in YYYY-MM-DD format")
    .describe("Date in ISO format (YYYY-MM-DD)"),
  revenue: z
    .number()
    .min(0)
    .max(999999999)
    .describe("Revenue in cents for this date"),
});

export const RevenueResponseSchema = z.object({
  data: z
    .array(RevenueDaySchema)
    .max(365)
    .describe("Daily revenue data points ordered chronologically"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const revenueRouteDoc: RouteDoc = {
  path: "/api/admin/analytics/revenue",
  method: "get",
  scope: "internal",
  summary: "Get daily revenue data",
  description:
    "Returns daily revenue figures for a configurable time range. Each data point contains a date and the total revenue for that day. Requires admin authentication.",
  tags: ["Admin", "Analytics"],
  security: [{ cookieAuth: [] }],
  parameters: [
    {
      name: "days",
      in: "query",
      required: false,
      description: "Number of days to look back (default 30, max 365)",
      schema: {
        type: "integer",
        minimum: 1,
        maximum: 365,
        default: 30,
        example: 30,
      },
    },
  ],
  responses: {
    "200": {
      description: "Daily revenue time series",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: {
                type: "array",
                maxItems: 365,
                description:
                  "Daily revenue data points ordered chronologically",
                items: {
                  type: "object",
                  properties: {
                    date: {
                      type: "string",
                      format: "date",
                      description: "Date in YYYY-MM-DD format",
                      example: "2026-03-15",
                    },
                    revenue: {
                      type: "number",
                      description: "Revenue in cents for this date",
                      example: 45200,
                    },
                  },
                },
              },
            },
          },
          example: {
            data: [
              { date: "2026-03-26", revenue: 45200 },
              { date: "2026-03-27", revenue: 62800 },
              { date: "2026-03-28", revenue: 31400 },
            ],
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
          example: { error: "Failed to load revenue data" },
        },
      },
    },
  },
};
