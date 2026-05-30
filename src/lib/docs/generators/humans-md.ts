import type { OpenAPIV3_1 } from "openapi-types";

/**
 * Generates human-readable Markdown documentation from an OpenAPI 3.1 spec.
 */
export function generateHumansMd(spec: OpenAPIV3_1.Document): string {
  const lines: string[] = [];
  const baseUrl = spec.servers?.[0]?.url ?? "http://localhost:3000";

  // Title
  lines.push(`# ${spec.info.title} — API Reference`);
  lines.push("");
  lines.push(spec.info.description ?? "");
  lines.push("");

  // Table of contents
  lines.push("## Table of Contents");
  lines.push("");
  const tags = spec.tags ?? [];
  for (const tag of tags) {
    const anchor = tag.name.toLowerCase().replace(/\s+/g, "-");
    lines.push(
      `- [${tag.name}](#${anchor})${tag.description ? ` — ${tag.description}` : ""}`,
    );
  }
  lines.push("");

  // Endpoints grouped by tag
  const pathsByTag = groupByTag(spec);

  for (const tag of tags) {
    const ops = pathsByTag[tag.name];
    if (!ops?.length) continue;

    lines.push(`## ${tag.name}`);
    if (tag.description) lines.push(`> ${tag.description}`);
    lines.push("");

    for (const op of ops) {
      const authBadge = isPublic(op.operation)
        ? "` PUBLIC `"
        : "` AUTH REQUIRED `";

      lines.push(`### ${op.method.toUpperCase()} \`${op.path}\``);
      lines.push("");
      lines.push(`**${op.operation.summary ?? ""}** ${authBadge}`);
      lines.push("");

      if (op.operation.description) {
        lines.push(op.operation.description);
        lines.push("");
      }

      // Dashboard trigger
      const trigger = (op.operation as Record<string, unknown>)[
        "x-dashboard-trigger"
      ];
      if (trigger) {
        lines.push(`> **Dashboard:** ${trigger}`);
        lines.push("");
      }

      // Rate limit
      const rl = (op.operation as Record<string, unknown>)["x-rate-limit"] as
        | { window?: string; max?: number }
        | undefined;
      if (rl) {
        lines.push(`> **Rate Limit:** ${rl.max} requests per ${rl.window}`);
        lines.push("");
      }

      // Parameters table
      const params = op.operation.parameters as
        | OpenAPIV3_1.ParameterObject[]
        | undefined;
      if (params?.length) {
        lines.push("#### Parameters");
        lines.push("");
        lines.push("| Name | In | Type | Required | Description |");
        lines.push("|------|-----|------|----------|-------------|");
        for (const p of params) {
          const schema = p.schema as OpenAPIV3_1.SchemaObject | undefined;
          const type = schema?.type ?? "string";
          lines.push(
            `| \`${p.name}\` | ${p.in} | ${type} | ${p.required ? "Yes" : "No"} | ${p.description ?? ""} |`,
          );
        }
        lines.push("");
      }

      // Request body
      const body = op.operation.requestBody as
        | OpenAPIV3_1.RequestBodyObject
        | undefined;
      if (body) {
        lines.push("#### Request Body");
        lines.push("");
        const jsonContent = body.content?.["application/json"];
        if (jsonContent?.schema) {
          const schema = jsonContent.schema as OpenAPIV3_1.SchemaObject;
          renderSchemaTable(schema, lines);

          // Example
          if (jsonContent.example) {
            lines.push("**Example:**");
            lines.push("```json");
            lines.push(JSON.stringify(jsonContent.example, null, 2));
            lines.push("```");
            lines.push("");
          }
        }
      }

      // Responses
      lines.push("#### Responses");
      lines.push("");
      lines.push("| Status | Description |");
      lines.push("|--------|-------------|");
      for (const [code, response] of Object.entries(
        op.operation.responses ?? {},
      )) {
        const res = response as OpenAPIV3_1.ResponseObject;
        lines.push(`| ${code} | ${res.description ?? ""} |`);
      }
      lines.push("");

      // cURL example
      lines.push("**cURL Example:**");
      lines.push("```bash");
      if (op.method === "get") {
        lines.push(`curl "${baseUrl}${op.path}"`);
      } else {
        const exampleBody = body?.content?.["application/json"]?.example;
        if (exampleBody) {
          lines.push(
            `curl -X ${op.method.toUpperCase()} "${baseUrl}${op.path}" \\`,
          );
          lines.push(`  -H "Content-Type: application/json" \\`);
          lines.push(`  -d '${JSON.stringify(exampleBody)}'`);
        } else {
          lines.push(
            `curl -X ${op.method.toUpperCase()} "${baseUrl}${op.path}"`,
          );
        }
      }
      lines.push("```");
      lines.push("");

      lines.push("---");
      lines.push("");
    }
  }

  // Error reference
  lines.push("## Error Reference");
  lines.push("");
  lines.push("All errors return a JSON object with an `error` field:");
  lines.push("```json");
  lines.push('{ "error": "Human-readable error message" }');
  lines.push("```");
  lines.push("");
  lines.push(
    "Validation errors (400) additionally include structured details:",
  );
  lines.push("```json");
  lines.push("{");
  lines.push('  "error": "Validation failed",');
  lines.push('  "details": {');
  lines.push('    "fieldErrors": { "email": ["Invalid email address"] },');
  lines.push('    "formErrors": []');
  lines.push("  }");
  lines.push("}");
  lines.push("```");
  lines.push("");

  return lines.join("\n");
}

// Helpers:

interface OpEntry {
  path: string;
  method: string;
  operation: OpenAPIV3_1.OperationObject;
}

function groupByTag(spec: OpenAPIV3_1.Document): Record<string, OpEntry[]> {
  const result: Record<string, OpEntry[]> = {};
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

function renderSchemaTable(
  schema: OpenAPIV3_1.SchemaObject,
  lines: string[],
): void {
  if (schema.type !== "object" || !schema.properties) return;

  lines.push("| Field | Type | Required | Constraints | Description |");
  lines.push("|-------|------|----------|-------------|-------------|");

  for (const [name, prop] of Object.entries(schema.properties)) {
    const p = prop as OpenAPIV3_1.SchemaObject;
    const required = schema.required?.includes(name) ? "Yes" : "No";
    const type = Array.isArray(p.type)
      ? p.type.join(" \\| ")
      : (p.type ?? "any");
    const constraints: string[] = [];
    if (p.minLength !== undefined)
      constraints.push(`minLength: ${p.minLength}`);
    if (p.maxLength !== undefined)
      constraints.push(`maxLength: ${p.maxLength}`);
    if (p.minimum !== undefined) constraints.push(`min: ${p.minimum}`);
    if (p.maximum !== undefined) constraints.push(`max: ${p.maximum}`);
    if (p.pattern) constraints.push(`pattern`);
    if (p.format) constraints.push(`format: ${p.format}`);
    if (p.enum) constraints.push(`enum: ${(p.enum as string[]).join(", ")}`);
    const constraintStr = constraints.join(", ") || "\u2014";
    const desc = p.description ?? "";
    lines.push(
      `| \`${name}\` | ${type} | ${required} | ${constraintStr} | ${desc} |`,
    );
  }
  lines.push("");
}
