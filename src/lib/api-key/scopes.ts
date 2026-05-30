/**
 * API key scopes for the storefront API.
 *
 * Format: "resource:action" → description
 * Stored in better-auth's permissions field as Record<string, string[]>
 * e.g. { products: ["read"], cart: ["read", "write"] }
 */
export const API_SCOPES = {
  // Content
  "content:read": "Browse blogs, FAQs, media, and variant catalog",
  // Products
  "products:read": "Browse products and product details",
  // Cart
  "cart:read": "View cart contents",
  "cart:write": "Manage cart items and apply discounts",
  // Orders
  "orders:read": "View order history and order details",
  // Payments
  "payments:read": "Calculate payment amounts and totals",
  // Discounts
  "discounts:read": "Validate discount codes",
  // Addresses
  "addresses:read": "View saved shipping addresses",
  "addresses:write": "Create, update, and delete addresses",
  // Billing
  "billing:read": "View saved payment methods",
  "billing:write": "Manage payment methods and billing details",
  // Reviews
  "reviews:read": "Read product reviews and ratings",
  "reviews:write": "Submit and manage product reviews",
  // Wishlist
  "wishlist:read": "View wishlist items",
  "wishlist:write": "Add and remove wishlist items",
  // Search
  "search:read": "Search products and blogs",
  // Recommendations
  "recommendations:read": "Get related product recommendations",
  // Contact
  "contact:write": "Submit contact form messages",
  // Newsletter
  "newsletter:write": "Subscribe to newsletter",
  // Tokens
  "tokens:read": "List child tokens created by this key",
  "tokens:write": "Create scoped child tokens (sub-keys)",
} as const;

export type ApiScope = keyof typeof API_SCOPES;

/** All available scope keys. */
export const ALL_SCOPES = Object.keys(API_SCOPES) as ApiScope[];

/** Resource groups for UI display, each with an icon name from lucide-react. */
export const SCOPE_GROUPS = [
  {
    resource: "content",
    label: "Content",
    icon: "BookOpen",
    scopes: ["content:read"] as ApiScope[],
  },
  {
    resource: "products",
    label: "Products",
    icon: "ShoppingBag",
    scopes: ["products:read"] as ApiScope[],
  },
  {
    resource: "cart",
    label: "Cart",
    icon: "ShoppingCart",
    scopes: ["cart:read", "cart:write"] as ApiScope[],
  },
  {
    resource: "orders",
    label: "Orders",
    icon: "Package",
    scopes: ["orders:read"] as ApiScope[],
  },
  {
    resource: "payments",
    label: "Payments",
    icon: "Receipt",
    scopes: ["payments:read"] as ApiScope[],
  },
  {
    resource: "discounts",
    label: "Discounts",
    icon: "Tag",
    scopes: ["discounts:read"] as ApiScope[],
  },
  {
    resource: "addresses",
    label: "Addresses",
    icon: "MapPin",
    scopes: ["addresses:read", "addresses:write"] as ApiScope[],
  },
  {
    resource: "billing",
    label: "Billing",
    icon: "CreditCard",
    scopes: ["billing:read", "billing:write"] as ApiScope[],
  },
  {
    resource: "reviews",
    label: "Reviews",
    icon: "Star",
    scopes: ["reviews:read", "reviews:write"] as ApiScope[],
  },
  {
    resource: "wishlist",
    label: "Wishlist",
    icon: "Heart",
    scopes: ["wishlist:read", "wishlist:write"] as ApiScope[],
  },
  {
    resource: "search",
    label: "Search",
    icon: "Search",
    scopes: ["search:read"] as ApiScope[],
  },
  {
    resource: "recommendations",
    label: "Recommendations",
    icon: "Sparkles",
    scopes: ["recommendations:read"] as ApiScope[],
  },
  {
    resource: "contact",
    label: "Contact",
    icon: "MessageSquare",
    scopes: ["contact:write"] as ApiScope[],
  },
  {
    resource: "newsletter",
    label: "Newsletter",
    icon: "Mail",
    scopes: ["newsletter:write"] as ApiScope[],
  },
  {
    resource: "tokens",
    label: "Tokens",
    icon: "KeyRound",
    scopes: ["tokens:read", "tokens:write"] as ApiScope[],
  },
] as const;

/**
 * Convert flat scope strings to better-auth permissions format.
 * ["products:read", "cart:read", "cart:write"] → { products: ["read"], cart: ["read", "write"] }
 */
export function scopesToPermissions(
  scopes: ApiScope[],
): Record<string, string[]> {
  const perms: Record<string, string[]> = {};
  for (const scope of scopes) {
    const [resource, action] = scope.split(":");
    if (!resource || !action) continue;
    if (!perms[resource]) perms[resource] = [];
    perms[resource].push(action);
  }
  return perms;
}

/**
 * Convert better-auth permissions back to flat scope strings.
 * { products: ["read"], cart: ["read", "write"] } → ["products:read", "cart:read", "cart:write"]
 */
export function permissionsToScopes(
  perms: Record<string, string[]> | null | undefined,
): ApiScope[] {
  if (!perms) return [];
  const scopes: ApiScope[] = [];
  for (const [resource, actions] of Object.entries(perms)) {
    for (const action of actions) {
      const scope = `${resource}:${action}` as ApiScope;
      if (scope in API_SCOPES) scopes.push(scope);
    }
  }
  return scopes;
}
