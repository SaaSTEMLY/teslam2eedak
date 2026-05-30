import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const BrowserTokenResponseSchema = z.object({
  token: z
    .string()
    .min(1)
    .max(2048)
    .describe(
      "Short-lived browser token for subscribing to SaaSignal channels",
    ),
});

export const BrowserTokenErrorSchema = z.object({
  error: z.string().min(1).max(500).describe("Error message"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const browserTokenRouteDoc: RouteDoc = {
  path: "/api/saasignal/browser-token",
  method: "post",
  scope: "internal",
  summary: "Create a SaaSignal browser token",
  description:
    "Creates a short-lived browser token that grants the authenticated user permission to subscribe to SaaSignal real-time channels. Requires authentication — anonymous users receive a 401 error.",
  tags: ["SaaSignal"],
  security: [{ cookieAuth: [] }],
  responses: {
    "200": {
      description: "Browser token created successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              token: {
                type: "string",
                minLength: 1,
                maxLength: 2048,
                description:
                  "Short-lived browser token for subscribing to SaaSignal channels",
                example:
                  "sst_br_eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOlsiY2hhbm5lbHM6c3Vic2NyaWJlIl19.abc123",
              },
            },
          },
          example: {
            token:
              "sst_br_eyJhbGciOiJIUzI1NiJ9.eyJzY29wZXMiOlsiY2hhbm5lbHM6c3Vic2NyaWJlIl19.abc123",
          },
        },
      },
    },
    "401": {
      description: "Unauthorized — user is not authenticated",
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
          example: { error: "Failed to create browser token" },
        },
      },
    },
  },
};
