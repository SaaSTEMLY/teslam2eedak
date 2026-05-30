import type { OpenAPIV3_1 } from "openapi-types";

import {
  sharedSchemas,
  securitySchemes,
  apiTags,
  apiInfo,
  publicApiInfo,
  PUBLIC_CUSTOM_TAGS,
  PUBLIC_PAYLOAD_SLUGS,
  PUBLIC_WRITABLE_SLUGS,
  PUBLIC_READ_SLUGS,
  type DocScope,
} from "@/lib/docs/shared-schemas";
import { customRouteDocs } from "@/lib/docs/custom-routes";
import type { RouteDoc } from "@/lib/docs/types";

let cachedPublicSpec: OpenAPIV3_1.Document | null = null;
let cachedFullSpec: OpenAPIV3_1.Document | null = null;

/**
 * Converts a RouteDoc into an OpenAPI OperationObject.
 */
function routeDocToOperation(doc: RouteDoc): OpenAPIV3_1.OperationObject {
  const operation: OpenAPIV3_1.OperationObject = {
    summary: doc.summary,
    description: doc.description,
    tags: doc.tags,
    responses: doc.responses as Record<string, OpenAPIV3_1.ResponseObject>,
  };

  if (doc.security !== undefined) {
    operation.security = doc.security;
  }
  if (doc.parameters) {
    operation.parameters = doc.parameters;
  }
  if (doc.requestBody) {
    operation.requestBody = doc.requestBody;
  }
  if (doc["x-dashboard-trigger"]) {
    (operation as Record<string, unknown>)["x-dashboard-trigger"] =
      doc["x-dashboard-trigger"];
  }
  if (doc["x-rate-limit"]) {
    (operation as Record<string, unknown>)["x-rate-limit"] =
      doc["x-rate-limit"];
  }

  return operation;
}

/**
 * Fetches the Payload-generated OpenAPI spec from the internal endpoint.
 * Returns null if unavailable (e.g., during build).
 */
async function fetchPayloadSpec(): Promise<OpenAPIV3_1.Document | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/payload-spec.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as OpenAPIV3_1.Document;
  } catch {
    return null;
  }
}

/**
 * Builds the custom routes portion of the OpenAPI spec,
 * optionally filtering to only public routes.
 */
function buildCustomPaths(scope: DocScope): OpenAPIV3_1.PathsObject {
  const paths: OpenAPIV3_1.PathsObject = {};

  for (const doc of customRouteDocs) {
    if (scope === "public") {
      // Skip routes explicitly marked internal
      if (doc.scope === "internal") continue;
      // Skip routes whose tags are all outside the public set
      if (!doc.tags.some((t) => PUBLIC_CUSTOM_TAGS.has(t))) continue;
    }

    // Convert Next.js path params to OpenAPI format: [param] -> {param}
    const openApiPath = doc.path.replace(/\[([^\]]+)\]/g, "{$1}");

    if (!paths[openApiPath]) {
      paths[openApiPath] = {};
    }

    (paths[openApiPath] as Record<string, unknown>)[doc.method] =
      routeDocToOperation(doc);
  }

  return paths;
}

/**
 * Filters Payload-generated paths to only include public collection slugs.
 * For read-only collections (not in PUBLIC_WRITABLE_SLUGS), strips write
 * methods (POST, PATCH, DELETE) so only GET is exposed in public docs.
 */
function filterPayloadPaths(
  paths: OpenAPIV3_1.PathsObject,
): OpenAPIV3_1.PathsObject {
  const filtered: OpenAPIV3_1.PathsObject = {};
  const writeMethods = ["post", "patch", "delete", "put"] as const;

  for (const [path, item] of Object.entries(paths)) {
    const match = path.match(/^\/api\/([^/]+)/);
    if (!match) continue;
    const slug = match[1] ?? "";
    if (!PUBLIC_PAYLOAD_SLUGS.has(slug)) continue;

    if (PUBLIC_WRITABLE_SLUGS.has(slug)) {
      // Full CRUD access
      filtered[path] = item;
    } else {
      // Read-only: strip write methods
      const readOnly = { ...item } as Record<string, unknown>;
      for (const method of writeMethods) {
        delete readOnly[method];
      }
      // Only include if there's still at least one method (GET)
      if (!readOnly.get) continue;

      // Mark GET as public (no auth) for collections with open read access
      if (PUBLIC_READ_SLUGS.has(slug)) {
        const getOp = readOnly.get as Record<string, unknown>;
        readOnly.get = { ...getOp, security: [] };
      }

      filtered[path] = readOnly as OpenAPIV3_1.PathItemObject;
    }
  }
  return filtered;
}

/**
 * Filters tags to only include those actually referenced by the given paths.
 */
function filterUsedTags(
  allTags: OpenAPIV3_1.TagObject[],
  paths: OpenAPIV3_1.PathsObject,
): OpenAPIV3_1.TagObject[] {
  const usedTags = new Set<string>();
  const methods = ["get", "post", "put", "patch", "delete"] as const;

  for (const pathItem of Object.values(paths)) {
    if (!pathItem) continue;
    for (const method of methods) {
      const op = (pathItem as Record<string, unknown>)[method] as
        | OpenAPIV3_1.OperationObject
        | undefined;
      if (op?.tags) {
        for (const t of op.tags) usedTags.add(t);
      }
    }
  }

  return allTags.filter((t) => usedTags.has(t.name));
}

/**
 * Recursively resolves all `$ref` pointers in an object tree against the
 * provided component maps. Also ensures non-204 responses have `content`.
 */
function deepResolveRefs(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  components: Record<string, Record<string, unknown>>,
  visited = new Set<string>(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (obj === null || obj === undefined || typeof obj !== "object") return obj;
  if (Array.isArray(obj))
    return obj.map((item) => deepResolveRefs(item, components, visited));

  // Resolve $ref — always resolve, only track visited for circular prevention within a single chain
  if (typeof obj.$ref === "string") {
    const ref = obj.$ref as string;
    if (visited.has(ref)) return obj; // prevent circular within same resolution chain

    // Match #/components/{section}/{name}
    const match = ref.match(/^#\/components\/(\w+)\/(.+)$/);
    if (match) {
      const [, section, name] = match;
      if (!section || !name) return obj;
      const resolved = components[section]?.[name];
      if (resolved) {
        // Create a new visited set for this resolution chain to allow
        // the same $ref to be resolved in multiple locations
        const chainVisited = new Set(visited);
        chainVisited.add(ref);
        return deepResolveRefs({ ...resolved }, components, chainVisited);
      }
    }
    return obj; // unresolvable ref — leave as-is
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = deepResolveRefs(value, components, visited);
  }
  return result;
}

/**
 * Resolves all `$ref` pointers in paths and ensures non-204 responses have `content`.
 */
function resolveAllRefs(
  paths: OpenAPIV3_1.PathsObject,
  payloadSpec: OpenAPIV3_1.Document | null,
): OpenAPIV3_1.PathsObject {
  // Build a lookup of all component sections
  const components: Record<string, Record<string, unknown>> = {};
  if (payloadSpec?.components) {
    for (const [section, entries] of Object.entries(payloadSpec.components)) {
      if (entries && typeof entries === "object") {
        components[section] = entries as Record<string, unknown>;
      }
    }
  }

  const resolved = deepResolveRefs(
    JSON.parse(JSON.stringify(paths)),
    components,
  ) as OpenAPIV3_1.PathsObject;

  // Ensure non-204 responses have content for Scalar compatibility
  const methods = ["get", "post", "put", "patch", "delete"] as const;
  for (const pathItem of Object.values(resolved)) {
    if (!pathItem) continue;
    for (const method of methods) {
      const op = (pathItem as Record<string, unknown>)[method] as
        | OpenAPIV3_1.OperationObject
        | undefined;
      if (!op?.responses) continue;
      for (const [code, resp] of Object.entries(op.responses)) {
        const r = resp as Record<string, unknown>;
        if (code !== "204" && !r.content) {
          r.content = {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
              },
            },
          };
        }
      }
    }
  }

  return resolved;
}

/**
 * Fixes payload-oapi's `where` parameter schemas that use
 * `allOf: [{ type: "object" }, { anyOf: [...] }]`. The bare `{ type: "object" }`
 * causes openapi-typescript to generate `Record<string, never> & (union)` — an
 * impossible intersection. We flatten it to just the `anyOf` union.
 */
function fixWhereParameterSchemas(paths: OpenAPIV3_1.PathsObject): void {
  const methods = ["get", "post", "put", "patch", "delete"] as const;
  for (const pathItem of Object.values(paths)) {
    if (!pathItem) continue;
    for (const method of methods) {
      const op = (pathItem as Record<string, unknown>)[method] as
        | (OpenAPIV3_1.OperationObject & {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parameters?: any[];
          })
        | undefined;
      if (!op?.parameters) continue;
      for (const param of op.parameters) {
        if (param.name === "where" && param.schema?.allOf) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const anyOfEntry = param.schema.allOf.find((item: any) => item.anyOf);
          if (anyOfEntry) {
            param.schema = anyOfEntry;
          }
        }
      }
    }
  }
}

/**
 * Returns the unified OpenAPI 3.1 specification merging Payload collections
 * with custom application routes.
 *
 * @param scope - "public" for storefront-facing docs, "full" for all endpoints.
 */
export async function getMergedOpenAPISpec(
  scope: DocScope = "full",
): Promise<OpenAPIV3_1.Document> {
  // Return cached spec in production
  const cached = scope === "public" ? cachedPublicSpec : cachedFullSpec;
  if (cached && process.env.NODE_ENV === "production") {
    return cached;
  }

  const payloadSpec = await fetchPayloadSpec();
  const customPaths = buildCustomPaths(scope);

  let payloadPaths = payloadSpec?.paths ?? {};
  if (scope === "public") {
    payloadPaths = filterPayloadPaths(payloadPaths);
  }

  const mergedPaths = {
    ...payloadPaths,
    ...customPaths,
  };

  // Fix payload-oapi's allOf wrapper on `where` params that breaks code generation.
  // allOf: [{ type: "object" }, { anyOf: [...] }] → just { anyOf: [...] }
  fixWhereParameterSchemas(mergedPaths);

  const allTags = [...(payloadSpec?.tags ?? []), ...apiTags];

  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const merged: OpenAPIV3_1.Document = {
    openapi: "3.1.0",
    info: scope === "public" ? publicApiInfo : apiInfo,
    servers: [
      {
        url: baseUrl,
        description: "API Server",
      },
    ],
    externalDocs: {
      description: "Human-readable API reference (Markdown)",
      url: `${baseUrl}/to-humans.md`,
    },
    tags: scope === "public" ? filterUsedTags(allTags, mergedPaths) : allTags,
    paths: {
      ...resolveAllRefs(mergedPaths, payloadSpec),
      "/api/openapi.json": {
        get: {
          summary: "OpenAPI 3.1 specification (JSON)",
          description:
            "Returns this API's full OpenAPI 3.1 specification as JSON. " +
            "Use this to generate client SDKs, import into API tools (Postman, Insomnia), " +
            "or power interactive documentation UIs.",
          tags: ["Documentation"],
          security: [],
          responses: {
            "200": {
              description: "OpenAPI 3.1 JSON specification",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          summary: "LLM-friendly API reference (plain text)",
          description:
            "Returns the full API reference as structured plain text optimized for LLM context windows. " +
            "Use this to feed API documentation into AI assistants, chatbots, or code generators.",
          tags: ["Documentation"],
          security: [],
          responses: {
            "200": {
              description: "Plain-text API reference",
              content: {
                "text/plain": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
      "/to-humans.md": {
        get: {
          summary: "Human-readable API reference (Markdown)",
          description:
            "Returns the full API reference as a Markdown document with table of contents, " +
            "request/response tables, cURL examples, and error reference. " +
            "Suitable for rendering in documentation sites or reading directly.",
          tags: ["Documentation"],
          security: [],
          responses: {
            "200": {
              description: "Markdown API reference",
              content: {
                "text/markdown": {
                  schema: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        ...(payloadSpec?.components?.schemas ?? {}),
        ...sharedSchemas,
      },
      securitySchemes: {
        ...(payloadSpec?.components?.securitySchemes ?? {}),
        ...securitySchemes,
      },
    },
    security: [{ cookieAuth: [] }, { apiKeyAuth: [] }],
  };

  if (scope === "public") {
    cachedPublicSpec = merged;
  } else {
    cachedFullSpec = merged;
  }

  return merged;
}
