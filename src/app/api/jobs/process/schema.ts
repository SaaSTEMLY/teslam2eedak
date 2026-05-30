import { z } from "zod/v4";
import type { RouteDoc } from "@/lib/docs/types";

// ─── Zod Schemas ─────────────────────────────────────────

export const JobRequestSchema = z.object({
  job_id: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Unique identifier for this job instance"),
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .describe("Job queue name (alternative to queue field)"),
  queue: z
    .enum([
      "email:order-confirmation",
      "email:order-status",
      "search:sync",
      "ranking:sync",
    ])
    .optional()
    .describe("Job queue identifier that determines the processing handler"),
  payload: z
    .record(z.string().min(1).max(100), z.unknown())
    .optional()
    .describe("Arbitrary job data payload, contents depend on the queue type"),
});

export const JobSuccessResponseSchema = z.object({
  ok: z.literal(true).describe("Indicates successful job processing"),
});

export const JobErrorResponseSchema = z.object({
  error: z
    .string()
    .min(1)
    .max(500)
    .describe("Error message describing what went wrong"),
});

// ─── OpenAPI Route Doc ───────────────────────────────────

export const jobsProcessRouteDoc: RouteDoc = {
  path: "/api/jobs/process",
  method: "post",
  scope: "internal",
  summary: "Process a background job",
  description:
    "Internal endpoint that processes background jobs dispatched by the job queue system. Supports order confirmation emails, order status update emails, and product search/ranking sync. The `queue` (or `name`) field determines the handler, and `payload` provides handler-specific data.",
  tags: ["Internal", "Jobs"],
  security: [],
  "x-dashboard-trigger":
    "Triggered automatically by the background job queue system",
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            job_id: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Unique identifier for this job instance",
              example: "job_abc123",
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              description: "Job queue name (alternative to queue)",
              example: "email:order-confirmation",
            },
            queue: {
              type: "string",
              enum: [
                "email:order-confirmation",
                "email:order-status",
                "search:sync",
                "ranking:sync",
              ],
              description:
                "Job queue identifier. Takes precedence over name if both provided",
              example: "email:order-confirmation",
            },
            payload: {
              type: "object",
              description:
                "Job-specific data. For email:order-confirmation: { orderId }. For email:order-status: { orderId, newStatus }. For search/ranking:sync: { productId }.",
              example: { orderId: 42 },
            },
          },
        },
        examples: {
          "order-confirmation": {
            summary: "Send order confirmation email",
            value: {
              job_id: "job_conf_001",
              queue: "email:order-confirmation",
              payload: { orderId: 42 },
            },
          },
          "order-status": {
            summary: "Send order status update email",
            value: {
              job_id: "job_status_002",
              queue: "email:order-status",
              payload: { orderId: 42, newStatus: "shipped" },
            },
          },
          "product-sync": {
            summary: "Sync product to search index",
            value: {
              job_id: "job_sync_003",
              queue: "search:sync",
              payload: { productId: 15 },
            },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Job processed successfully",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              ok: {
                type: "boolean",
                description: "Always true on success",
                example: true,
              },
            },
          },
          example: { ok: true },
        },
      },
    },
    "400": {
      description: "Unknown job queue name",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ValidationError" },
          example: { error: "Unknown queue: invalid-queue" },
        },
      },
    },
    "500": {
      description: "Internal server error during job processing",
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/Error" },
          example: { error: "Job processing failed" },
        },
      },
    },
  },
};
