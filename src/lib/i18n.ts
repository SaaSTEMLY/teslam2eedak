import { getLocale, type SupportedLocale } from "./locale";

import type headerEn from "@/messages/header/en";
import type footerEn from "@/messages/footer/en";
import type homeEn from "@/messages/home/en";
import type contactEn from "@/messages/contact/en";
import type legalEn from "@/messages/legal/en";
import type termsEn from "@/messages/terms/en";
import type privacyEn from "@/messages/privacy/en";
import type licenseEn from "@/messages/license/en";
import type faqEn from "@/messages/faq/en";
import type blogsEn from "@/messages/blogs/en";
import type productsEn from "@/messages/products/en";
import type cartEn from "@/messages/cart/en";
import type authEn from "@/messages/auth/en";
import type authUiEn from "@/messages/auth-ui/en";
import type accountEn from "@/messages/account/en";
import type checkoutEn from "@/messages/checkout/en";
import type addCardDialogEn from "@/messages/add-card-dialog/en";
import type emailEn from "@/messages/email/en";
import type aboutEn from "@/messages/about/en";
import type reviewsEn from "@/messages/reviews/en";
import type searchEn from "@/messages/search/en";
import type wishlistEn from "@/messages/wishlist/en";
import type developerEn from "@/messages/developer/en";

// Explicit loader map — each arrow function is a discrete chunk boundary.
// Template-string dynamic imports (e.g. `import(`@/messages/${ns}/${locale}`)`)
// cannot be tree-shaken by webpack/next.
const loaders = {
  header: {
    en: () => import("@/messages/header/en"),
    ar: () => import("@/messages/header/ar"),
    es: () => import("@/messages/header/es"),
  },
  footer: {
    en: () => import("@/messages/footer/en"),
    ar: () => import("@/messages/footer/ar"),
    es: () => import("@/messages/footer/es"),
  },
  home: {
    en: () => import("@/messages/home/en"),
    ar: () => import("@/messages/home/ar"),
    es: () => import("@/messages/home/es"),
  },
  contact: {
    en: () => import("@/messages/contact/en"),
    ar: () => import("@/messages/contact/ar"),
    es: () => import("@/messages/contact/es"),
  },
  legal: {
    en: () => import("@/messages/legal/en"),
    ar: () => import("@/messages/legal/ar"),
    es: () => import("@/messages/legal/es"),
  },
  terms: {
    en: () => import("@/messages/terms/en"),
    ar: () => import("@/messages/terms/ar"),
    es: () => import("@/messages/terms/es"),
  },
  privacy: {
    en: () => import("@/messages/privacy/en"),
    ar: () => import("@/messages/privacy/ar"),
    es: () => import("@/messages/privacy/es"),
  },
  license: {
    en: () => import("@/messages/license/en"),
    ar: () => import("@/messages/license/ar"),
    es: () => import("@/messages/license/es"),
  },
  faq: {
    en: () => import("@/messages/faq/en"),
    ar: () => import("@/messages/faq/ar"),
    es: () => import("@/messages/faq/es"),
  },
  blogs: {
    en: () => import("@/messages/blogs/en"),
    ar: () => import("@/messages/blogs/ar"),
    es: () => import("@/messages/blogs/es"),
  },
  products: {
    en: () => import("@/messages/products/en"),
    ar: () => import("@/messages/products/ar"),
    es: () => import("@/messages/products/es"),
  },
  cart: {
    en: () => import("@/messages/cart/en"),
    ar: () => import("@/messages/cart/ar"),
    es: () => import("@/messages/cart/es"),
  },
  auth: {
    en: () => import("@/messages/auth/en"),
    ar: () => import("@/messages/auth/ar"),
    es: () => import("@/messages/auth/es"),
  },
  "auth-ui": {
    en: () => import("@/messages/auth-ui/en"),
    ar: () => import("@/messages/auth-ui/ar"),
    es: () => import("@/messages/auth-ui/es"),
  },
  account: {
    en: () => import("@/messages/account/en"),
    ar: () => import("@/messages/account/ar"),
    es: () => import("@/messages/account/es"),
  },
  checkout: {
    en: () => import("@/messages/checkout/en"),
    ar: () => import("@/messages/checkout/ar"),
    es: () => import("@/messages/checkout/es"),
  },
  "add-card-dialog": {
    en: () => import("@/messages/add-card-dialog/en"),
    ar: () => import("@/messages/add-card-dialog/ar"),
    es: () => import("@/messages/add-card-dialog/es"),
  },
  email: {
    en: () => import("@/messages/email/en"),
    ar: () => import("@/messages/email/ar"),
    es: () => import("@/messages/email/es"),
  },
  about: {
    en: () => import("@/messages/about/en"),
    ar: () => import("@/messages/about/ar"),
    es: () => import("@/messages/about/es"),
  },
  reviews: {
    en: () => import("@/messages/reviews/en"),
    ar: () => import("@/messages/reviews/ar"),
    es: () => import("@/messages/reviews/es"),
  },
  search: {
    en: () => import("@/messages/search/en"),
    ar: () => import("@/messages/search/ar"),
    es: () => import("@/messages/search/es"),
  },
  wishlist: {
    en: () => import("@/messages/wishlist/en"),
    ar: () => import("@/messages/wishlist/ar"),
    es: () => import("@/messages/wishlist/es"),
  },
  developer: {
    en: () => import("@/messages/developer/en"),
    ar: () => import("@/messages/developer/ar"),
    es: () => import("@/messages/developer/es"),
  },
} satisfies Record<
  string,
  Record<SupportedLocale, () => Promise<{ default: Record<string, string> }>>
>;

/** Namespace → message shape (derived from EN source-of-truth files). */
type MessageMap = {
  header: typeof headerEn;
  footer: typeof footerEn;
  home: typeof homeEn;
  contact: typeof contactEn;
  legal: typeof legalEn;
  terms: typeof termsEn;
  privacy: typeof privacyEn;
  license: typeof licenseEn;
  faq: typeof faqEn;
  blogs: typeof blogsEn;
  products: typeof productsEn;
  cart: typeof cartEn;
  auth: typeof authEn;
  "auth-ui": typeof authUiEn;
  account: typeof accountEn;
  checkout: typeof checkoutEn;
  "add-card-dialog": typeof addCardDialogEn;
  email: typeof emailEn;
  about: typeof aboutEn;
  reviews: typeof reviewsEn;
  search: typeof searchEn;
  wishlist: typeof wishlistEn;
  developer: typeof developerEn;
};

export type Messages<N extends keyof MessageMap> = MessageMap[N];

/**
 * Load translations for a namespace. Server-side only.
 * Only the active locale's chunk is loaded (tree-shakeable).
 */
export async function getMessages<N extends keyof MessageMap>(
  namespace: N,
): Promise<Messages<N>> {
  const locale = await getLocale();
  const nsLoaders = loaders[namespace];
  const loader = nsLoaders[locale] ?? nsLoaders.en;
  const mod = await loader();
  return mod.default as Messages<N>;
}

/** Simple interpolation: replaces {key} tokens in a message string. */
export function t(
  messages: Record<string, string>,
  key: string,
  params?: Record<string, string | number>,
): string {
  let value = (messages as Record<string, string>)[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replaceAll(`{${k}}`, String(v));
    }
  }
  return value;
}
