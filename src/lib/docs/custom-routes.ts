import type { RouteDoc } from "@/lib/docs/types";

// ---------------------------------------------------------------------------
// Import all route documentation from schema files
// ---------------------------------------------------------------------------

// Contact
import { contactPost } from "@/app/api/contact/schema";

// Newsletter
import { newsletterPost } from "@/app/api/newsletter/schema";

// Reviews
import { reviewsGet, reviewsPost } from "@/app/api/reviews/schema";
import { reviewHelpfulPost } from "@/app/api/reviews/[reviewId]/helpful/schema";

// Wishlist
import { wishlistGet, wishlistPost } from "@/app/api/wishlist/schema";
import { wishlistItemDelete } from "@/app/api/wishlist/[itemId]/schema";
import { wishlistCheckGet } from "@/app/api/wishlist/check/[productId]/schema";

// Cart & Discounts
import { applyDiscountDoc } from "@/app/api/cart/apply-discount/schema";
import { removeDiscountDoc } from "@/app/api/cart/remove-discount/schema";
import { validateDiscountDoc } from "@/app/api/discount/validate/schema";

// Payments
import { paymentAmountDoc } from "@/app/api/payment-amount/schema";

// Orders
import { ordersDoc } from "@/app/api/orders/schema";

// Billing
import { billingPostDoc } from "@/app/api/billing/schema";

// Account
import { deleteAccountDoc } from "@/app/api/delete-account/schema";
import { avatarDoc } from "@/app/api/avatar/schema";

// Search
import { searchRouteDoc } from "@/app/api/search/schema";
import { suggestRouteDoc } from "@/app/api/search/suggest/schema";

// Recommendations
import { relatedProductsRouteDoc } from "@/app/api/recommendations/related/[productId]/schema";
import { signalRouteDoc } from "@/app/api/recommendations/signal/schema";

// Admin Analytics
import { analyticsSummaryRouteDoc } from "@/app/api/admin/analytics/summary/schema";
import { revenueRouteDoc } from "@/app/api/admin/analytics/revenue/schema";
import { topProductsRouteDoc } from "@/app/api/admin/analytics/top-products/schema";

// Jobs
import { jobsProcessRouteDoc } from "@/app/api/jobs/process/schema";

// SaaSignal
import { browserTokenRouteDoc } from "@/app/api/saasignal/browser-token/schema";

// ---------------------------------------------------------------------------
// Combined registry
// ---------------------------------------------------------------------------

/** All custom API route documentation. */
export const customRouteDocs: RouteDoc[] = [
  // Contact
  contactPost,

  // Newsletter
  newsletterPost,

  // Reviews
  reviewsGet,
  reviewsPost,
  reviewHelpfulPost,

  // Wishlist
  wishlistGet,
  wishlistPost,
  wishlistItemDelete,
  wishlistCheckGet,

  // Cart & Discounts
  applyDiscountDoc,
  removeDiscountDoc,
  validateDiscountDoc,

  // Payments
  paymentAmountDoc,

  // Orders
  ordersDoc,

  // Billing
  billingPostDoc,

  // Account
  deleteAccountDoc,
  avatarDoc,

  // Search
  searchRouteDoc,
  suggestRouteDoc,

  // Recommendations
  relatedProductsRouteDoc,
  signalRouteDoc,

  // Admin Analytics
  analyticsSummaryRouteDoc,
  revenueRouteDoc,
  topProductsRouteDoc,

  // Jobs
  jobsProcessRouteDoc,

  // SaaSignal
  browserTokenRouteDoc,
];
