import type { OpenAPIV3_1 } from "openapi-types";

/** Documentation for a single custom API route handler. */
export interface RouteDoc {
  /** The URL path, e.g. "/api/contact". Use {param} for path params. */
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  /** Short one-line summary (shown in sidebar). */
  summary: string;
  /** Longer description with markdown support. */
  description: string;
  /** Tags for grouping in the docs UI. */
  tags: string[];
  /** Security requirements. Empty array = public endpoint. Omit = inherits default. */
  security?: OpenAPIV3_1.SecurityRequirementObject[];
  /** Path and query parameters. */
  parameters?: OpenAPIV3_1.ParameterObject[];
  /** Request body definition. */
  requestBody?: OpenAPIV3_1.RequestBodyObject;
  /** Response definitions keyed by status code. */
  responses: Record<string, OpenAPIV3_1.ResponseObject>;
  /** How to trigger this from the admin dashboard (for supplementary docs). */
  "x-dashboard-trigger"?: string;
  /** Rate limiting info. */
  "x-rate-limit"?: { window: string; max: number };
  /** Doc visibility. "internal" hides from public docs. Defaults to "public". */
  scope?: "public" | "internal";
}
