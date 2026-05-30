import type { OpenAPIV3_1 } from "openapi-types";

// ─── Documentation Scope ────────────────────────────────────────────────────

/** Controls which endpoints appear in generated docs. */
export type DocScope = "public" | "full";

/**
 * Custom-route tags included in public (storefront) docs.
 * Routes whose tags are ALL outside this set are excluded from the public spec.
 */
export const PUBLIC_CUSTOM_TAGS: ReadonlySet<string> = new Set([
  "Contact",
  "Newsletter",
  "Reviews",
  "Wishlist",
  "Cart",
  "Discounts",
  "Payments",
  "Orders",
  "Search",
  "Recommendations",
  "Documentation",
]);

/**
 * Payload collection slugs included in public (storefront) docs.
 * Collections not listed here are excluded from the public spec entirely.
 */
export const PUBLIC_PAYLOAD_SLUGS: ReadonlySet<string> = new Set([
  "products",
  "carts",
  "orders",
  "variants",
  "variantTypes",
  "variantOptions",
  "addresses",
  "media",
  "blogs",
  "faqs",
  "reviews",
]);

/**
 * Payload collections where consumers can write (POST/PATCH/DELETE).
 * All other public collections are read-only (GET only) in public docs.
 */
export const PUBLIC_WRITABLE_SLUGS: ReadonlySet<string> = new Set([
  "carts", // consumers manage their cart
  "addresses", // consumers manage shipping addresses
]);

/**
 * Payload collections with public read access (no auth needed for GET).
 * GET operations on these collections will have their security requirement
 * stripped so they display as [public] in the docs.
 */
export const PUBLIC_READ_SLUGS: ReadonlySet<string> = new Set([
  "products",
  "variants",
  "variantTypes",
  "variantOptions",
  "media",
  "blogs",
  "faqs",
  "reviews",
]);

// ─── Shared Schemas ─────────────────────────────────────────────────────────

/** Reusable OpenAPI component schemas for consistent error and response formats. */
export const sharedSchemas: Record<string, OpenAPIV3_1.SchemaObject> = {
  Error: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "string",
        description: "Human-readable error message.",
        example: "Internal server error",
      },
    },
  },
  ValidationError: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "string",
        description: "Summary of the validation failure.",
        example: "Validation failed",
      },
      details: {
        type: "object",
        description: "Structured validation error details from Zod.",
        properties: {
          fieldErrors: {
            type: "object",
            additionalProperties: {
              type: "array",
              items: { type: "string" },
            },
            description: "Per-field error messages.",
            example: { email: ["Invalid email address"] },
          },
          formErrors: {
            type: "array",
            items: { type: "string" },
            description: "Form-level error messages.",
            example: [],
          },
        },
      },
    },
  },
  SuccessResponse: {
    type: "object",
    required: ["success"],
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
    },
  },
  ProductHit: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Unique product identifier from the search index",
      },
      score: {
        type: "number",
        description: "Relevance score from the search engine",
      },
      document: {
        type: "object",
        properties: {
          name: { type: "string", description: "Product display name" },
          slug: { type: "string", description: "URL-safe product slug" },
          description: { type: "string", description: "Product description" },
          priceInUSD: {
            type: "number",
            description: "Product price in US dollars",
          },
          category: { type: "string", description: "Product category slug" },
          imageUrl: {
            type: "string",
            description: "URL of the product thumbnail image",
          },
        },
      },
    },
  },
  PaginatedResponse: {
    type: "object",
    properties: {
      docs: {
        type: "array",
        items: {},
        description: "Array of documents for the current page.",
      },
      totalDocs: {
        type: "integer",
        description: "Total number of matching documents.",
        example: 42,
      },
      totalPages: {
        type: "integer",
        description: "Total number of pages.",
        example: 5,
      },
      page: {
        type: "integer",
        description: "Current page number (1-indexed).",
        example: 1,
      },
      limit: {
        type: "integer",
        description: "Maximum documents per page.",
        example: 10,
      },
      hasNextPage: { type: "boolean", example: true },
      hasPrevPage: { type: "boolean", example: false },
    },
  },
};

/** Security scheme definitions. */
export const securitySchemes: Record<string, OpenAPIV3_1.SecuritySchemeObject> =
  {
    cookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "better-auth.session_token",
      description:
        "Session cookie set by Better-Auth after login. " +
        "Authenticate via POST /api/auth/sign-in/email or OAuth flow.",
    },
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-api-key",
      description:
        "API key for programmatic access. " +
        "Create keys at /account/developer or via POST /api/auth/api-key/create. " +
        "Keys are scoped — only endpoints matching the key's permissions are accessible.",
    },
  };

/** Tags with descriptions for grouping endpoints in the docs UI. */
export const apiTags: OpenAPIV3_1.TagObject[] = [
  {
    name: "Contact",
    description: "Contact form submissions.",
  },
  {
    name: "Newsletter",
    description: "Email newsletter subscriptions.",
  },
  {
    name: "Reviews",
    description: "Product reviews and ratings.",
  },
  {
    name: "Wishlist",
    description: "Customer product wishlists.",
  },
  {
    name: "Cart",
    description: "Shopping cart discount management.",
  },
  {
    name: "Discounts",
    description: "Discount code validation.",
  },
  {
    name: "Payments",
    description: "Payment amount calculation.",
  },
  {
    name: "Orders",
    description: "Customer order history.",
  },
  {
    name: "Billing",
    description: "Stripe billing and subscription management.",
  },
  {
    name: "Account",
    description: "User account management.",
  },
  {
    name: "Search",
    description: "Product search and autocomplete.",
  },
  {
    name: "Recommendations",
    description: "Product recommendations and tracking.",
  },
  {
    name: "Admin",
    description: "Admin-only analytics and management endpoints.",
  },
  {
    name: "Jobs",
    description: "Background job processing.",
  },
  {
    name: "SaaSignal",
    description: "SaaSignal analytics integration.",
  },
  {
    name: "Documentation",
    description:
      "Machine-readable and human-readable API documentation endpoints.",
  },
];

/** Full API info (includes admin/internal docs). */
export const apiInfo: OpenAPIV3_1.InfoObject = {
  title: "Koffee Kulture API",
  version: "1.0.0",
  description:
    "Enterprise-grade SaaS API with ecommerce, authentication, and content management.\n\n" +
    "## Authentication\n\n" +
    "Most endpoints require a session cookie (`better-auth.session_token`). " +
    "Obtain one by signing in via `POST /api/auth/sign-in/email` with `{ email, password }`. " +
    "The session cookie is automatically set in the response.\n\n" +
    "## Rate Limiting\n\n" +
    "Some endpoints (discount validation, contact form) are rate-limited. " +
    "Rate limit details are documented per-endpoint via the `x-rate-limit` extension.\n\n" +
    "## Error Format\n\n" +
    "All errors return `{ error: string }`. Validation errors additionally include " +
    "`{ details: { fieldErrors, formErrors } }` with per-field messages.",
  contact: {
    name: "API Support",
    email: "support@koffee-kulture.com",
  },
  license: {
    name: "MIT",
  },
};

/** Public storefront API info (consumer-facing docs). */
export const publicApiInfo: OpenAPIV3_1.InfoObject = {
  title: "Koffee Kulture Storefront API",
  version: "1.0.0",
  description:
    "API for building storefronts and ecommerce experiences.\n\n" +
    "## Quick Start\n\n" +
    "1. **Authenticate** — `POST /api/auth/sign-in/email` with `{ email, password }` " +
    "to get a session cookie, or browse as a guest\n" +
    "2. **Browse products** — `GET /api/products` to list products, " +
    "`GET /api/products/{id}` for details\n" +
    "3. **Search** — `GET /api/search?q=keyword` for full-text search\n" +
    "4. **Add to cart** — Use the cart endpoints to manage items\n" +
    "5. **Apply discount** — `POST /api/cart/apply-discount` with a discount code\n" +
    "6. **Checkout** — `POST /api/payment-amount` to calculate the final total, " +
    "then complete payment via Stripe\n" +
    "7. **View orders** — `GET /api/orders` to see order history\n\n" +
    "## Authentication\n\n" +
    "Two authentication methods are supported:\n\n" +
    "**Session Cookie** — Sign in via `POST /api/auth/sign-in/email` with `{ email, password }`. " +
    "The `better-auth.session_token` cookie is set automatically.\n\n" +
    "**API Key** — Pass an `x-api-key` header with a scoped API key. " +
    "Create keys at `/account/developer` or via `POST /api/auth/api-key/create`. " +
    "Keys are scoped to specific resources (products, cart, orders, reviews, wishlist).\n\n" +
    "## Error Format\n\n" +
    "All errors return `{ error: string }`. Validation errors additionally include " +
    "`{ details: { fieldErrors, formErrors } }` with per-field messages.",
  contact: {
    name: "API Support",
    email: "support@koffee-kulture.com",
  },
  license: {
    name: "MIT",
  },
};
