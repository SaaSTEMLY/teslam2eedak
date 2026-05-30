import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const SignalRequestSchema = z.object({
  productId: z
    .union([z.string().min(1).max(20), z.number().int().min(1).max(2147483647)])
    .describe("The product ID that the signal is associated with"),
  signal: z
    .enum(["view", "add_to_cart", "purchase", "wishlist", "click"])
    .describe(
      "Type of user interaction signal. Weight is assigned automatically: purchase=5, add_to_cart=3, others=1",
    ),
});

export const SignalResponseSchema = z.object({
  ok: z
    .boolean()
    .describe(
      "Whether the signal was accepted (always true, even on internal errors)",
    ),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const signalRouteDoc: RouteDoc = {
  path: "/api/recommendations/signal",
  method: "post",
  scope: "internal",
  summary: "Log a product interaction signal",
  description:
    "Records a user interaction signal (view, add_to_cart, purchase, etc.) for the SaaSignal ranking engine. If the user is authenticated, the signal is associated with their user ID; otherwise it is logged as anonymous. This endpoint never returns an error to the client to avoid disrupting the user experience.",
  tags: ["Recommendations"],
  security: [],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["productId", "signal"],
          properties: {
            productId: {
              oneOf: [
                { type: "string", minLength: 1, maxLength: 20 },
                { type: "integer", minimum: 1, maximum: 2147483647 },
              ],
              description: "The product ID that the signal is associated with",
              example: "42",
            },
            signal: {
              type: "string",
              enum: ["view", "add_to_cart", "purchase", "wishlist", "click"],
              description:
                "Type of user interaction. Weight: purchase=5, add_to_cart=3, others=1",
              example: "view",
            },
          },
        },
        example: {
          productId: "42",
          signal: "view",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Signal accepted successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              ok: {
                type: "boolean",
                description: "Always true",
                example: true,
              },
            },
          },
          example: { ok: true },
        },
      },
    },
    "400": {
      description: "Missing required fields",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { error: "productId and signal are required" },
        },
      },
    },
  },
};
