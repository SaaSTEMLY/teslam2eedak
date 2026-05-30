const messages = {
  title: "API Keys",
  description:
    "Create and manage API keys for programmatic access to the storefront API.",
  learnMore: "View API documentation",

  // Create key
  createKey: "Create API Key",
  keyName: "Key name",
  keyNamePlaceholder: "My integration",
  expiration: "Expiration",
  expirationNever: "Never",
  expiration30: "30 days",
  expiration60: "60 days",
  expiration90: "90 days",
  expiration365: "1 year",
  scopes: "Permissions",
  scopesDescription: "Select the API resources this key can access.",
  selectAll: "Select all",
  deselectAll: "Deselect all",
  scopesSelected: "{count} selected",
  create: "Create",
  creating: "Creating...",

  // Scope labels
  scopeContentRead: "Read",
  scopeProductsRead: "Read",
  scopeCartRead: "Read",
  scopeCartWrite: "Write",
  scopeOrdersRead: "Read",
  scopePaymentsRead: "Read",
  scopeDiscountsRead: "Validate",
  scopeAddressesRead: "Read",
  scopeAddressesWrite: "Write",
  scopeBillingRead: "Read",
  scopeBillingWrite: "Write",
  scopeReviewsRead: "Read",
  scopeReviewsWrite: "Write",
  scopeWishlistRead: "Read",
  scopeWishlistWrite: "Write",
  scopeSearchRead: "Search",
  scopeRecommendationsRead: "Read",
  scopeContactWrite: "Submit",
  scopeNewsletterWrite: "Subscribe",
  scopeTokensRead: "List",
  scopeTokensWrite: "Create",

  // Scope descriptions
  scopeContentReadDesc: "Browse blogs, FAQs, media, and variant catalog",
  scopeProductsReadDesc: "Browse products and product details",
  scopeCartReadDesc: "View cart contents",
  scopeCartWriteDesc: "Manage cart items and apply discounts",
  scopeOrdersReadDesc: "View order history and order details",
  scopePaymentsReadDesc: "Calculate payment amounts and totals",
  scopeDiscountsReadDesc: "Validate discount codes",
  scopeAddressesReadDesc: "View saved shipping addresses",
  scopeAddressesWriteDesc: "Create, update, and delete addresses",
  scopeBillingReadDesc: "View saved payment methods",
  scopeBillingWriteDesc: "Manage payment methods and billing details",
  scopeReviewsReadDesc: "Read product reviews and ratings",
  scopeReviewsWriteDesc: "Submit and manage product reviews",
  scopeWishlistReadDesc: "View wishlist items",
  scopeWishlistWriteDesc: "Add and remove wishlist items",
  scopeSearchReadDesc: "Search products and blogs",
  scopeRecommendationsReadDesc: "Get related product recommendations",
  scopeContactWriteDesc: "Submit contact form messages",
  scopeNewsletterWriteDesc: "Subscribe to newsletter",
  scopeTokensReadDesc: "List child tokens created by this key",
  scopeTokensWriteDesc: "Create scoped child tokens (sub-keys)",

  // Token delegation indicators
  subToken: "Sub-token",
  subTokenOf: "Created by: {name}",
  canDelegate: "Can delegate",

  // Key reveal
  keyCreated: "API key created",
  keyCreatedDescription:
    "Copy your API key now. You won't be able to see it again.",
  copyKey: "Copy",
  copied: "Copied!",
  done: "Done",

  // Key list
  noKeys: "No API keys yet",
  noKeysDescription: "Create an API key to access the API programmatically.",
  name: "Name",
  key: "Key",
  created: "Created",
  expiresLabel: "Expires",
  statusLabel: "Status",
  active: "Active",
  expired: "Expired",
  disabled: "Disabled",
  never: "Never",
  revoke: "Revoke",
  revoking: "Revoking...",

  // Confirm revoke
  confirmRevokeTitle: "Revoke API key?",
  confirmRevokeDescription:
    "Are you sure you want to revoke this API key? Any applications using it will lose access immediately.",
  cancel: "Cancel",
  confirm: "Revoke",

  // Errors
  failedToCreate: "Failed to create API key",
  failedToLoad: "Failed to load API keys",
  failedToRevoke: "Failed to revoke API key",
  keyRevoked: "API key revoked",
  nameRequired: "Key name is required",
  scopeRequired: "Select at least one permission",
} as const;

export default messages;
export type DeveloperMessages = Record<keyof typeof messages, string>;
