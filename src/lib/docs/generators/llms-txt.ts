import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Generates llms.txt from an OpenAPI 3.1 document.
 * Format: structured plain text for LLM context windows.
 */
export function generateLlmsTxt(spec: OpenAPIV3_1.Document): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${spec.info.title}`);
  lines.push(`> ${spec.info.description?.split("\n")[0] ?? ""}`);
  lines.push("");

  // Auth overview
  lines.push("## Authentication");
  lines.push("Session-based via cookie `better-auth.session_token`.");
  lines.push("Sign in: POST /api/auth/sign-in/email { email, password }");
  lines.push("Endpoints marked [public] do not require authentication.");
  lines.push("");

  // Endpoints grouped by tag
  const pathsByTag = groupPathsByTag(spec);

  for (const [tag, operations] of Object.entries(pathsByTag)) {
    lines.push(`## ${tag}`);
    lines.push("");

    for (const op of operations) {
      const authLabel = isPublic(op.operation) ? "[public]" : "[auth required]";
      lines.push(`### ${op.method.toUpperCase()} ${op.path}`);
      lines.push(`${op.operation.summary ?? "No summary"} ${authLabel}`);
      lines.push("");

      if (op.operation.description) {
        lines.push(op.operation.description.split("\n")[0] ?? "");
        lines.push("");
      }

      // Parameters
      const params = op.operation.parameters as
        | OpenAPIV3_1.ParameterObject[]
        | undefined;
      if (params?.length) {
        lines.push("Parameters:");
        for (const p of params) {
          const schema = p.schema as OpenAPIV3_1.SchemaObject | undefined;
          const type = schema?.type ?? "string";
          const req = p.required ? "required" : "optional";
          lines.push(
            `  ${p.name} (${type}, ${p.in}, ${req}): ${p.description ?? ""}`,
          );
        }
        lines.push("");
      }

      // Request body
      const body = op.operation.requestBody as
        | OpenAPIV3_1.RequestBodyObject
        | undefined;
      if (body) {
        const jsonContent = body.content?.["application/json"];
        if (jsonContent?.schema) {
          lines.push("Request body (JSON):");
          describeSchema(
            jsonContent.schema as OpenAPIV3_1.SchemaObject,
            lines,
            "  ",
          );
          lines.push("");
        }
      }

      // Responses
      lines.push("Responses:");
      for (const [code, response] of Object.entries(
        op.operation.responses ?? {},
      )) {
        const res = response as OpenAPIV3_1.ResponseObject;
        lines.push(`  ${code}: ${res.description ?? ""}`);
      }
      lines.push("");

      // Extensions
      const dashboardTrigger = (op.operation as Record<string, unknown>)[
        "x-dashboard-trigger"
      ];
      if (dashboardTrigger) {
        lines.push(`Dashboard: ${dashboardTrigger}`);
        lines.push("");
      }

      const rateLimit = (op.operation as Record<string, unknown>)[
        "x-rate-limit"
      ] as { window?: string; max?: number } | undefined;
      if (rateLimit) {
        lines.push(
          `Rate limit: ${rateLimit.max} requests per ${rateLimit.window}`,
        );
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

// Helper types and functions:

interface OperationEntry {
  path: string;
  method: string;
  operation: OpenAPIV3_1.OperationObject;
}

function groupPathsByTag(
  spec: OpenAPIV3_1.Document,
): Record<string, OperationEntry[]> {
  const result: Record<string, OperationEntry[]> = {};
  const methods = ["get", "post", "put", "patch", "delete"] as const;

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    if (!pathItem) continue;
    for (const method of methods) {
      const operation = (pathItem as Record<string, unknown>)[method] as
        | OpenAPIV3_1.OperationObject
        | undefined;
      if (!operation) continue;

      const tags = operation.tags?.length ? operation.tags : ["Other"];
      for (const tag of tags) {
        if (!result[tag]) result[tag] = [];
        result[tag].push({ path, method, operation });
      }
    }
  }

  return result;
}

function isPublic(op: OpenAPIV3_1.OperationObject): boolean {
  return Array.isArray(op.security) && op.security.length === 0;
}

function describeSchema(
  schemaOrRef: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject,
  lines: string[],
  indent: string,
): void {
  if ("$ref" in schemaOrRef) {
    lines.push(`${indent}$ref: ${schemaOrRef.$ref}`);
    return;
  }

  const schema = schemaOrRef;

  if (schema.type === "object" && schema.properties) {
    for (const [name, prop] of Object.entries(schema.properties)) {
      const p = prop as OpenAPIV3_1.SchemaObject;
      const required = schema.required?.includes(name)
        ? "required"
        : "optional";
      const type = Array.isArray(p.type)
        ? p.type.join(" | ")
        : (p.type ?? "any");
      const constraints: string[] = [];
      if (p.minLength !== undefined) constraints.push(`min: ${p.minLength}`);
      if (p.maxLength !== undefined) constraints.push(`max: ${p.maxLength}`);
      if (p.minimum !== undefined) constraints.push(`min: ${p.minimum}`);
      if (p.maximum !== undefined) constraints.push(`max: ${p.maximum}`);
      if (p.pattern) constraints.push(`pattern: ${p.pattern}`);
      if (p.format) constraints.push(`format: ${p.format}`);
      if (p.enum) constraints.push(`enum: ${p.enum.join(", ")}`);
      const constraintStr = constraints.length
        ? ` [${constraints.join(", ")}]`
        : "";
      const desc = p.description ? ` — ${p.description}` : "";
      const example =
        p.example !== undefined ? ` (e.g. ${JSON.stringify(p.example)})` : "";
      lines.push(
        `${indent}${name}: ${type}${constraintStr} (${required})${desc}${example}`,
      );
    }
  } else if (schema.type === "array" && schema.items) {
    lines.push(`${indent}Array of:`);
    describeSchema(
      schema.items as OpenAPIV3_1.SchemaObject,
      lines,
      indent + "  ",
    );
  }
}
