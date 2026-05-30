import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import {
  lexicalEditor,
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
} from "@payloadcms/richtext-lexical";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { buildConfig } from "payload";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { betterAuthPlugin } from "payload-auth/better-auth";
import { betterAuthPluginOptions } from "./lib/auth/options";
import { resendAdapter } from "@payloadcms/email-resend";
import { ContactFormSubmissions } from "./collections/contact-form-submissions";
import { Blogs } from "./collections/blogs";
import { Media } from "./collections/media";
import { FAQs } from "./collections/faqs";
import {
  DiscountCodes,
  incrementUsageOnOrder,
} from "./collections/discount-codes";
import { Reviews } from "./collections/reviews";
import { Wishlists } from "./collections/wishlists";
import { NewsletterSubscribers } from "./collections/newsletter-subscribers";
import { Locations } from "./collections/locations";
import { Tables } from "./collections/tables";
import { ModifierGroups } from "./collections/modifier-groups";
import { sendOrderConfirmationEmail } from "./lib/email/order-confirmation";
import { sendOrderStatusEmail } from "./lib/email/order-status";
import { syncOrderToSaaSignal, checkLowStockAlert } from "./lib/saasignal-sync";
import { jobCreate } from "./lib/saasignal";
import "./lib/env-validation";
import { Effect } from "effect";
import { runHookEffect } from "./lib/effect/hook-runner";
import type {
  CollectionAfterChangeHook,
  CollectionBeforeChangeHook,
} from "payload";
import Stripe from "stripe";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { openapi } from "payload-oapi";

const isDev = process.env.NODE_ENV !== "production";

const shouldPushSchema = (dbUrl: string) => {
  // Opt-in/out override
  const override = process.env.PAYLOAD_SCHEMA_PUSH;
  if (override === "true") return true;
  if (override === "false") return false;

  // In production, never auto-push schemas.
  if (!isDev) return false;

  // Default behavior in dev: only push automatically when using local SQLite
  // and the DB file doesn't exist yet (first run). This avoids repeated
  // interactive prompts and accidental data-loss pushes on every restart.
  if (!dbUrl.startsWith("file:")) return false;

  const rawPath = dbUrl.slice("file:".length);
  if (!rawPath) return false;

  const resolvedPath = rawPath.startsWith("/")
    ? rawPath
    : path.resolve(process.cwd(), rawPath);

  return !fs.existsSync(resolvedPath);
};

// Database URL validation for production
const getDatabaseUrl = () => {
  const dbUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;

  if (!isDev) {
    if (!dbUrl) {
      throw new Error(
        "🔴 CRITICAL: DATABASE_URL environment variable is not set!\n\n" +
          "Your Vercel deployment needs a remote database connection.\n\n" +
          "Required Environment Variables in Vercel:\n" +
          "  DATABASE_URL=libsql://your-database.turso.io\n" +
          "  DATABASE_AUTH_TOKEN=your_token_here\n" +
          "\n" +
          "OR use Turso-specific variables:\n" +
          "  TURSO_DATABASE_URL=libsql://your-database.turso.io\n" +
          "  TURSO_AUTH_TOKEN=your_token_here\n\n" +
          "Setup Instructions:\n" +
          "  1. Go to: https://turso.tech\n" +
          "  2. Create a database\n" +
          "  3. Get the URL and token\n" +
          "  4. Set them in: Vercel Project → Settings → Environment Variables\n" +
          "  5. Redeploy\n\n" +
          "See VERCEL-SETUP.md for detailed setup guide.",
      );
    }

    if (dbUrl.startsWith("file:")) {
      throw new Error(
        "🔴 CRITICAL: Cannot use local file database in production!\n\n" +
          `Current DATABASE_URL: ${dbUrl}\n\n` +
          "Local SQLite files don't work in Vercel's serverless environment.\n" +
          "You must use a remote database like Turso.\n\n" +
          "Fix: Set DATABASE_URL in Vercel to your Turso URL:\n" +
          "  DATABASE_URL=libsql://your-database.turso.io\n" +
          "  DATABASE_AUTH_TOKEN=your_token_here\n\n" +
          "OR use Turso-specific variables:\n" +
          "  TURSO_DATABASE_URL=libsql://your-database.turso.io\n" +
          "  TURSO_AUTH_TOKEN=your_token_here\n\n" +
          "See VERCEL-SETUP.md for detailed setup guide.",
      );
    }
  }

  return dbUrl || "file:./sqlite-data/saastarter.db";
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

// Populate discountCode/discountAmount on order from Stripe PaymentIntent metadata
const populateDiscountFromStripe: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== "create") return data;
  if (data.discountCode) return data; // Already set

  // The order references transactions — look up the first one for the PaymentIntent
  const transactionIds = data.transactions;
  if (!transactionIds?.length) return data;

  const txId =
    typeof transactionIds[0] === "object"
      ? transactionIds[0].id
      : transactionIds[0];

  try {
    const transaction = await req.payload.findByID({
      collection: "transactions",
      id: txId,
      depth: 0,
    });

    const paymentIntentId = (
      transaction as { stripe?: { paymentIntentID?: string } }
    )?.stripe?.paymentIntentID;
    if (!paymentIntentId) return data;

    const paymentIntent =
      await stripeInstance.paymentIntents.retrieve(paymentIntentId);

    const metadata = paymentIntent.metadata;
    if (metadata?.discountCode) {
      data.discountCode = metadata.discountCode;
      data.discountAmount = metadata.discountAmount
        ? parseInt(metadata.discountAmount, 10)
        : undefined;
    }
  } catch {
    // Non-critical — order still gets created without discount info
  }

  return data;
};

const sendOrderStatusUpdateHook: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return doc;

  const newStatus = doc.fulfillmentStatus;
  const oldStatus = previousDoc?.fulfillmentStatus;
  if (!newStatus || newStatus === oldStatus) return doc;

  const customerEmail =
    doc.customerEmail ??
    (typeof doc.customer === "object" && doc.customer?.email) ??
    null;
  if (!customerEmail) return doc;

  const customerName =
    typeof doc.customer === "object" && doc.customer
      ? doc.customer.name
      : undefined;

  runHookEffect(
    "sendOrderStatusUpdate",
    Effect.tryPromise(() =>
      sendOrderStatusEmail({
        orderId: doc.id,
        customerEmail,
        customerName,
        newStatus,
      }),
    ).pipe(Effect.asVoid, Effect.orDie),
    (msg, err) => req.payload.logger.error({ msg, err }),
  );

  return doc;
};

const sendOrderEmailHook: CollectionAfterChangeHook = ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return doc;

  const customerEmail =
    doc.customerEmail ??
    (typeof doc.customer === "object" && doc.customer?.email) ??
    null;
  if (!customerEmail) return doc;

  const userLocale = req.locale || "en";

  runHookEffect(
    "sendOrderEmail",
    Effect.gen(function* () {
      const items = yield* Effect.tryPromise(() =>
        Promise.all(
          (doc.items ?? []).map(
            async (item: {
              product?: unknown;
              variant?: unknown;
              quantity: number;
            }) => {
              let product = item.product;
              if (typeof product === "number") {
                try {
                  product = await req.payload.findByID({
                    collection: "products",
                    id: product,
                    depth: 1,
                    locale: userLocale,
                  });
                } catch {
                  product = null;
                }
              }

              let variant = item.variant;
              if (typeof variant === "number") {
                try {
                  variant = await req.payload.findByID({
                    collection: "variants",
                    id: variant,
                    depth: 1,
                    locale: userLocale,
                  });
                } catch {
                  variant = null;
                }
              }

              const resolvedProduct =
                typeof product === "object" && product !== null
                  ? (product as {
                      name?: string;
                      priceInUSD?: number | null;
                      images?: (number | { url?: string })[];
                    })
                  : null;

              const resolvedVariant =
                typeof variant === "object" && variant !== null
                  ? (variant as {
                      title?: string;
                      images?: (number | { url?: string })[];
                    })
                  : null;

              const variantFirstImage = resolvedVariant?.images?.[0];
              const productFirstImage = resolvedProduct?.images?.[0];
              const firstImage =
                (typeof variantFirstImage === "object"
                  ? variantFirstImage
                  : null) ??
                (typeof productFirstImage === "object"
                  ? productFirstImage
                  : null);
              const imageUrl = firstImage?.url ?? null;

              const name = resolvedVariant?.title
                ? `${resolvedProduct?.name ?? "Product"} — ${resolvedVariant.title}`
                : (resolvedProduct?.name ?? "Product");

              return {
                name,
                quantity: item.quantity,
                price: resolvedProduct?.priceInUSD ?? 0,
                imageUrl,
              };
            },
          ),
        ),
      ).pipe(Effect.orDie);

      const customerName =
        typeof doc.customer === "object" && doc.customer
          ? doc.customer.name
          : undefined;

      yield* Effect.tryPromise(() =>
        sendOrderConfirmationEmail({
          orderId: doc.id,
          customerEmail,
          customerName,
          items,
          totalAmount: doc.amount ?? 0,
          currency: doc.currency ?? "EGP",
          shippingAddress: doc.shippingAddress ?? null,
          orderDate: doc.createdAt,
          discountCode: doc.discountCode ?? null,
          discountAmount: doc.discountAmount ?? null,
        }),
      ).pipe(Effect.orDie);
    }),
    (msg, err) => req.payload.logger.error({ msg, err }),
  );

  return doc;
};

// ─── SaaSignal Sync Hooks ────────────────────────────────

const syncOrderToSaaSignalHook: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
}) => {
  const orderDoc = doc as unknown as {
    id: number;
    amount?: number;
    currency?: string;
    customerEmail?: string;
    fulfillmentStatus?: string;
    createdAt: string;
    customer?: number | { id: number | string; email?: string; name?: string };
    items?: {
      product?: number | { id: number; name?: string };
      quantity?: number;
    }[];
  };

  runHookEffect(
    "syncOrderToSaaSignal",
    Effect.tryPromise(() =>
      syncOrderToSaaSignal(
        orderDoc,
        operation,
        (previousDoc as typeof orderDoc)?.fulfillmentStatus,
      ),
    ).pipe(Effect.asVoid, Effect.orDie),
    (msg, err) => console.error(msg, err),
  );

  return doc;
};

const syncProductToSaaSignalHook: CollectionAfterChangeHook = ({
  doc,
  operation,
}) => {
  if (operation !== "create" && operation !== "update") return doc;

  const productId = (doc as unknown as { id: number }).id;

  runHookEffect(
    "syncProductToSaaSignal",
    Effect.tryPromise(() => jobCreate("search:sync", { productId })).pipe(
      Effect.asVoid,
      Effect.orDie,
    ),
    (msg, err) => console.error(msg, err),
  );

  return doc;
};

const checkInventoryHook: CollectionAfterChangeHook = ({ doc, operation }) => {
  if (operation !== "update") return doc;

  const variant = doc as unknown as {
    id: number;
    product?: number | { id: number; name?: string };
    inventory?: number;
  };

  if (variant.inventory !== undefined) {
    const productId =
      typeof variant.product === "number"
        ? variant.product
        : (variant.product?.id ?? 0);
    const productName =
      typeof variant.product === "object" ? variant.product?.name : undefined;

    runHookEffect(
      "checkInventory",
      Effect.tryPromise(() =>
        checkLowStockAlert(productId, variant.inventory!, productName),
      ).pipe(Effect.asVoid, Effect.orDie),
      (msg, err) => console.error(msg, err),
    );
  }

  return doc;
};

const emailAdapter = isDev
  ? undefined // Payload falls back to console logging in dev
  : resendAdapter({
      defaultFromAddress: "noreply@koffee-kulture.com",
      defaultFromName: "Koffee Kulture",
      apiKey: process.env.RESEND_API_KEY || "",
    });

export default buildConfig({
  admin: {
    meta: {
      titleSuffix: "— Koffee Kulture",
      description:
        "Koffee Kulture Kitchen — menu, orders, branches, and tables",
      icons: [
        {
          rel: "icon",
          type: "image/x-icon",
          url: "/logo/main/favicon.ico",
        },
      ],
    },
    avatar: {
      Component: "@/components/PayloadBranding#Avatar",
    },
    components: {
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: ["@/components/BeforeDashboard#BeforeDashboard"],
      graphics: {
        Icon: "@/components/PayloadBranding#Icon",
        Logo: "@/components/PayloadBranding#Logo",
      },
    },
  },
  // If you'd like to use Rich Text, pass your editor here
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      EXPERIMENTAL_TableFeature(),
      FixedToolbarFeature(),
      BlocksFeature({ blocks: [CodeBlock()] }),
    ],
  }),

  // Define and configure your collections in this array
  collections: [
    ContactFormSubmissions,
    Blogs,
    FAQs,
    DiscountCodes,
    Media,
    Reviews,
    Wishlists,
    NewsletterSubscribers,
    Locations,
    Tables,
    ModifierGroups,
  ],

  // Your Payload secret - should be a complex and secure string, unguessable
  secret: process.env.PAYLOAD_SECRET || "",
  // Whichever Database Adapter you're using should go here
  // SQLite for local development - zero setup required!
  // For production, consider PostgreSQL or another production-grade database
  db: sqliteAdapter({
    client: {
      url: getDatabaseUrl(),
      authToken:
        process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN, // Required for remote Turso databases
    },
    push: shouldPushSchema(getDatabaseUrl()),
  }),
  // If you want to resize images, crop, set focal point, etc.
  // make sure to install it and pass it to the config.
  // This is optional - if you don't need to do these things,
  // you don't need it!
  sharp,
  serverURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  email: emailAdapter,
  plugins: [
    seoPlugin({
      collections: ["products", "blogs"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) =>
        `${(doc as { name?: string; title?: string }).name || (doc as { name?: string; title?: string }).title || "Page"} | Koffee Kulture`,
      generateDescription: ({ doc }) =>
        (doc as { description?: string; excerpt?: string }).description ||
        (doc as { description?: string; excerpt?: string }).excerpt ||
        "",
    }),
    betterAuthPlugin(betterAuthPluginOptions),
    ecommercePlugin({
      carts: {
        cartsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          fields: [
            ...defaultCollection.fields,
            {
              name: "discountCode",
              type: "text",
              admin: {
                position: "sidebar",
                description: "Applied discount code for this cart",
              },
            },
            // ─── Restaurant cart fields ────────────────────────────
            {
              name: "fulfillmentMode",
              type: "select",
              required: true,
              defaultValue: "merch",
              options: [
                { label: "Dine-in", value: "dine-in" },
                { label: "Pickup (click & collect)", value: "pickup" },
                { label: "Delivery", value: "delivery" },
                { label: "Merch", value: "merch" },
              ],
              admin: {
                position: "sidebar",
                description:
                  "How this cart is fulfilled. Determines tax/service rules, payment provider allow-list, and ticket routing.",
              },
            },
            {
              name: "restaurantId",
              type: "text",
              defaultValue: "kk-main",
              admin: {
                position: "sidebar",
                description: "Reserved for multi-tenant.",
              },
            },
            {
              name: "location",
              type: "relationship",
              relationTo: "locations",
              admin: {
                description:
                  "Branch this cart was opened at. Required for dine-in and pickup; optional for delivery/merch.",
              },
            },
            {
              name: "table",
              type: "relationship",
              relationTo: "tables",
              admin: {
                description:
                  "Table this cart is paired with. Only set when fulfillmentMode = dine-in.",
              },
            },
            {
              name: "pickupTime",
              type: "date",
              admin: {
                description:
                  "When the guest plans to pick up. Null = ASAP. Only used when fulfillmentMode = pickup.",
                date: { pickerAppearance: "dayAndTime" },
              },
            },
            {
              name: "guestSessionId",
              type: "text",
              admin: {
                description:
                  "Anonymous session id (cookie-bound) that owns this cart.",
              },
            },
          ],
        }),
      },
      inventory: true,
      transactions: {
        transactionsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          hooks: {
            ...defaultCollection.hooks,
            beforeChange: [
              ...(defaultCollection.hooks?.beforeChange ?? []),
              async ({ data, operation, req }) => {
                // When creating a new transaction for a cart that already has a
                // pending transaction, delete the stale one first. The ecommerce
                // plugin's Stripe adapter reuses cart-item row IDs in the
                // transaction items array, which causes a PK collision in Postgres
                // if the old transaction still exists.
                if (operation === "create" && data.cart) {
                  const existing = await req.payload.find({
                    collection: "transactions",
                    where: {
                      cart: { equals: data.cart },
                      status: { equals: "pending" },
                    },
                    limit: 10,
                    overrideAccess: true,
                  });

                  for (const tx of existing.docs) {
                    await req.payload.delete({
                      collection: "transactions",
                      id: tx.id,
                      overrideAccess: true,
                    });
                  }
                }

                return data;
              },
            ],
          },
        }),
      },
      access: {
        adminOnlyFieldAccess: ({ req }) => !!req.user?.role?.includes("admin"),
        adminOrPublishedStatus: ({ req }) => {
          if (req.user?.role?.includes("admin")) return true;
          return { _status: { equals: "published" } };
        },
        isAdmin: ({ req }) => !!req.user?.role?.includes("admin"),
        isAuthenticated: ({ req }) => !!req.user,
        isCustomer: ({ req }) => !!req.user,
        isDocumentOwner: ({ req }) => {
          if (!req.user) return false;
          return { customer: { equals: req.user.id } };
        },
      },
      customers: { slug: "users" },
      products: {
        productsCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          hooks: {
            ...defaultCollection.hooks,
            afterChange: [
              ...(defaultCollection.hooks?.afterChange ?? []),
              syncProductToSaaSignalHook,
            ],
          },
          admin: {
            ...defaultCollection.admin,
            useAsTitle: "name",
            defaultColumns: ["name", "category", "priceInUSD", "_status"],
          },
          fields: [
            {
              name: "name",
              type: "text",
              required: true,
              localized: true,
              maxLength: 200,
              admin: {
                position: "sidebar",
              },
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              admin: {
                position: "sidebar",
                description: "URL-friendly version of the name",
              },
              hooks: {
                beforeValidate: [
                  ({
                    value,
                    data,
                  }: {
                    value?: string;
                    data?: { name?: string };
                  }) => {
                    if (!value && data?.name) {
                      return data.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                    }
                    return value;
                  },
                ],
              },
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              localized: true,
              maxLength: 1000,
              admin: {
                description: "Brief description shown in product listings",
              },
            },
            {
              name: "longDescription",
              type: "richText",
              localized: true,
              admin: {
                description: "Detailed product description",
              },
            },
            {
              name: "images",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              admin: {
                description: "Product images (first image is the main image)",
              },
            },
            {
              name: "category",
              type: "select",
              required: true,
              options: [
                {
                  label: { en: "Software", ar: "برمجيات", es: "Software" },
                  value: "software",
                },
                {
                  label: { en: "Templates", ar: "قوالب", es: "Plantillas" },
                  value: "templates",
                },
                {
                  label: { en: "Courses", ar: "دورات", es: "Cursos" },
                  value: "courses",
                },
                {
                  label: { en: "Services", ar: "خدمات", es: "Servicios" },
                  value: "services",
                },
                {
                  label: { en: "Other", ar: "أخرى", es: "Otros" },
                  value: "other",
                },
              ],
              defaultValue: "software",
              admin: {
                position: "sidebar",
              },
            },
            {
              name: "featured",
              type: "checkbox",
              defaultValue: false,
              admin: {
                position: "sidebar",
                description: "Show this product in featured sections",
              },
            },
            // ─── Restaurant / menu-item fields ───────────────────────
            {
              name: "restaurantId",
              type: "text",
              defaultValue: "kk-main",
              required: true,
              admin: {
                position: "sidebar",
                description:
                  "Reserved for multi-tenant. Single-tenant deployments use the default.",
              },
            },
            {
              name: "menuSection",
              type: "text",
              localized: true,
              admin: {
                description:
                  "Section heading for the structured menu list (e.g., 'Hot Klassiks', 'Bagels Kulture').",
              },
            },
            {
              name: "sizes",
              type: "array",
              labels: { singular: "Size", plural: "Sizes" },
              admin: {
                description:
                  "Optional size variants with their own price. If empty, the item has a single base price.",
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  localized: true,
                  admin: { description: "e.g., 'M' or 'L'." },
                },
                {
                  name: "value",
                  type: "text",
                  required: true,
                  admin: { description: "Stable id, e.g., 'm' / 'l'." },
                },
                {
                  name: "priceInUSD",
                  type: "number",
                  required: true,
                  admin: {
                    description:
                      "Price in qirsh (1/100 EGP). Currency follows order.currency at checkout time.",
                  },
                },
                {
                  name: "isDefault",
                  type: "checkbox",
                  defaultValue: false,
                  admin: {
                    description: "Pre-selected when the item sheet opens.",
                  },
                },
              ],
            },
            {
              name: "modifierGroups",
              type: "relationship",
              relationTo: "modifier-groups",
              hasMany: true,
              admin: {
                description:
                  "Reusable customisation groups attached to this item.",
              },
            },
            {
              name: "allergens",
              type: "select",
              hasMany: true,
              options: [
                { label: { en: "Vegan", ar: "نباتي صرف" }, value: "vegan" },
                { label: { en: "Vegetarian", ar: "نباتي" }, value: "vegetarian" },
                {
                  label: { en: "Gluten-free", ar: "خالي من الجلوتين" },
                  value: "gluten-free",
                },
                {
                  label: { en: "Dairy-free", ar: "خالي من الألبان" },
                  value: "dairy-free",
                },
                {
                  label: { en: "Contains nuts", ar: "يحتوي على مكسرات" },
                  value: "contains-nuts",
                },
                {
                  label: { en: "Contains soy", ar: "يحتوي على صويا" },
                  value: "contains-soy",
                },
                {
                  label: { en: "Contains eggs", ar: "يحتوي على بيض" },
                  value: "contains-eggs",
                },
              ],
              admin: {
                description:
                  "Allergen tags shown on the item sheet and used by the allergen filter.",
              },
            },
            {
              type: "group",
              name: "nutritionalInfo",
              label: "Nutritional Info",
              admin: {
                description:
                  "Optional per-serving nutritional info shown on the item sheet.",
              },
              fields: [
                { name: "calories", type: "number" },
                { name: "proteinGrams", type: "number" },
                { name: "carbsGrams", type: "number" },
                { name: "fatGrams", type: "number" },
                { name: "sugarGrams", type: "number" },
              ],
            },
            {
              name: "prepTimeMinutes",
              type: "number",
              min: 0,
              max: 120,
              defaultValue: 3,
              admin: {
                position: "sidebar",
                description:
                  "Average time to prepare. Used to compute ASAP pickup ETAs.",
              },
            },
            {
              name: "isAvailable",
              type: "checkbox",
              defaultValue: true,
              admin: {
                position: "sidebar",
                description:
                  "Uncheck to '86' the item (sold out). The menu shows it dimmed; add-to-cart is blocked.",
              },
            },
            {
              name: "unavailableUntil",
              type: "date",
              admin: {
                position: "sidebar",
                description:
                  "Optional auto-restock time. After this moment, the item becomes available again.",
                date: { pickerAppearance: "dayAndTime" },
              },
            },
            {
              name: "locationOverrides",
              type: "array",
              labels: {
                singular: "Branch Override",
                plural: "Branch Overrides",
              },
              admin: {
                description:
                  "Per-branch sparse overrides — only set the fields you want to differ from the restaurant default.",
              },
              fields: [
                {
                  name: "location",
                  type: "relationship",
                  relationTo: "locations",
                  required: true,
                },
                {
                  name: "priceInUSD",
                  type: "number",
                  admin: {
                    description:
                      "Override base price for this branch (in qirsh).",
                  },
                },
                {
                  name: "isAvailable",
                  type: "checkbox",
                  admin: {
                    description:
                      "Override availability for this branch. Leave unchecked AND unset to inherit.",
                  },
                },
                {
                  name: "prepTimeMinutes",
                  type: "number",
                  min: 0,
                  max: 120,
                },
              ],
            },
            {
              name: "hotspotBoxes",
              type: "json",
              admin: {
                description:
                  "Normalized bounding boxes drawn on menu images, linking this item to coordinates. Shape: Array<{ locale, menuImageId, x, y, w, h }> with x/y/w/h in 0–1. Authored by the admin hotspot tool.",
              },
            },
            {
              name: "posItemIds",
              type: "array",
              labels: { singular: "POS Mapping", plural: "POS Mappings" },
              admin: {
                description:
                  "Maps this menu item to its identifier in connected POS systems. Used by future POS adapters (Foodics, Marn, Square).",
              },
              fields: [
                {
                  name: "provider",
                  type: "select",
                  required: true,
                  options: [
                    { label: "Foodics", value: "foodics" },
                    { label: "Marn", value: "marn" },
                    { label: "Square", value: "square" },
                  ],
                },
                { name: "externalId", type: "text", required: true },
              ],
            },
            ...defaultCollection.fields,
          ],
        }),
        variants: {
          variantsCollectionOverride: ({ defaultCollection }) => ({
            ...defaultCollection,
            hooks: {
              ...defaultCollection.hooks,
              afterChange: [
                ...(defaultCollection.hooks?.afterChange ?? []),
                checkInventoryHook,
              ],
            },
            admin: {
              ...defaultCollection.admin,
              useAsTitle: "title",
              defaultColumns: ["title", "product", "priceInUSD", "inventory"],
              hidden: false,
            },
            fields: [
              {
                name: "images",
                type: "upload",
                relationTo: "media",
                hasMany: true,
                admin: {
                  description: "Variant images",
                },
              },
              ...defaultCollection.fields.map((field) => {
                // Make the title field localized
                if ("name" in field && field.name === "title") {
                  return {
                    ...field,
                    localized: true,
                  };
                }
                return field;
              }),
            ],
          }),
        },
      },
      orders: {
        ordersCollectionOverride: ({ defaultCollection }) => ({
          ...defaultCollection,
          hooks: {
            ...defaultCollection.hooks,
            beforeChange: [
              ...(defaultCollection.hooks?.beforeChange ?? []),
              populateDiscountFromStripe,
            ],
            afterChange: [
              ...(defaultCollection.hooks?.afterChange ?? []),
              sendOrderEmailHook,
              sendOrderStatusUpdateHook,
              incrementUsageOnOrder,
              syncOrderToSaaSignalHook,
            ],
          },
          fields: [
            ...defaultCollection.fields,
            {
              name: "fulfillmentStatus",
              type: "select",
              defaultValue: "pending",
              options: [
                {
                  label: { en: "Pending", ar: "قيد الانتظار", es: "Pendiente" },
                  value: "pending",
                },
                {
                  label: {
                    en: "Processing",
                    ar: "قيد المعالجة",
                    es: "Procesando",
                  },
                  value: "processing",
                },
                {
                  label: { en: "Shipped", ar: "تم الشحن", es: "Enviado" },
                  value: "shipped",
                },
                {
                  label: { en: "Delivered", ar: "تم التوصيل", es: "Entregado" },
                  value: "delivered",
                },
                {
                  label: { en: "Cancelled", ar: "ملغى", es: "Cancelado" },
                  value: "cancelled",
                },
              ],
              admin: {
                position: "sidebar",
                description: "Current fulfillment status of this order",
              },
            },
            {
              name: "discountCode",
              type: "text",
              admin: {
                description: "Discount code applied to this order",
                position: "sidebar",
                readOnly: true,
              },
            },
            {
              name: "discountAmount",
              type: "number",
              admin: {
                description: "Discount amount in cents that was applied",
                position: "sidebar",
                readOnly: true,
              },
            },
            // ─── Restaurant order fields ───────────────────────────
            {
              name: "fulfillmentMode",
              type: "select",
              required: true,
              defaultValue: "merch",
              options: [
                { label: "Dine-in", value: "dine-in" },
                { label: "Pickup (click & collect)", value: "pickup" },
                { label: "Delivery", value: "delivery" },
                { label: "Merch", value: "merch" },
              ],
              admin: {
                position: "sidebar",
                description:
                  "How this order is fulfilled. Captured from the cart at order-creation time.",
              },
            },
            {
              name: "kitchenStatus",
              type: "select",
              required: true,
              defaultValue: "placed",
              options: [
                {
                  label: { en: "Placed", ar: "متلقى", es: "Recibido" },
                  value: "placed",
                },
                {
                  label: {
                    en: "Preparing",
                    ar: "قيد التحضير",
                    es: "Preparando",
                  },
                  value: "preparing",
                },
                {
                  label: { en: "Ready", ar: "جاهز", es: "Listo" },
                  value: "ready",
                },
                {
                  label: { en: "Delivered", ar: "تم التسليم", es: "Entregado" },
                  value: "delivered",
                },
                {
                  label: { en: "Cancelled", ar: "ملغى", es: "Cancelado" },
                  value: "cancelled",
                },
              ],
              admin: {
                position: "sidebar",
                description:
                  "Live Orders Board kanban state. Separate from fulfillmentStatus, which tracks merch shipping.",
              },
            },
            {
              name: "restaurantId",
              type: "text",
              defaultValue: "kk-main",
              admin: { position: "sidebar" },
            },
            {
              name: "location",
              type: "relationship",
              relationTo: "locations",
              admin: {
                description:
                  "Branch this order belongs to. Drives the Live Orders Board scoping.",
              },
            },
            {
              name: "table",
              type: "relationship",
              relationTo: "tables",
              admin: {
                description:
                  "Table for dine-in orders. Shown on the ticket header.",
              },
            },
            {
              name: "pickupTime",
              type: "date",
              admin: {
                description: "When the guest is picking up (null = ASAP).",
                date: { pickerAppearance: "dayAndTime" },
              },
            },
            {
              name: "guestSessionId",
              type: "text",
              admin: { description: "Anonymous guest session for tracker URL." },
            },
            {
              name: "vatPercent",
              type: "number",
              defaultValue: 14,
              admin: {
                position: "sidebar",
                description:
                  "VAT rate snapshotted at order-creation time. Historical orders never change.",
              },
            },
            {
              name: "serviceChargePercent",
              type: "number",
              defaultValue: 0,
              admin: {
                position: "sidebar",
                description:
                  "Service charge rate snapshotted at order-creation time. Zero for pickup/delivery/merch by default.",
              },
            },
            {
              name: "tipAmount",
              type: "number",
              defaultValue: 0,
              admin: {
                position: "sidebar",
                description: "Tip amount in qirsh (separate from service charge).",
              },
            },
            {
              name: "kitchenAuditTrail",
              type: "array",
              labels: {
                singular: "Status Change",
                plural: "Status History",
              },
              admin: {
                description:
                  "Append-only log of kitchenStatus transitions. Used for ops debugging and SLA tracking.",
              },
              fields: [
                {
                  name: "from",
                  type: "text",
                  admin: {
                    description: "Previous kitchenStatus (null on creation).",
                  },
                },
                { name: "to", type: "text", required: true },
                {
                  name: "at",
                  type: "date",
                  required: true,
                  admin: { date: { pickerAppearance: "dayAndTime" } },
                },
                {
                  name: "byUserId",
                  type: "text",
                  admin: { description: "Staff user id, or 'system' for auto." },
                },
                {
                  name: "byUserName",
                  type: "text",
                  admin: { description: "Display name at the time of change." },
                },
              ],
            },
          ],
        }),
      },
      payments: {
        paymentMethods: [
          stripeAdapter({
            publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
            secretKey: process.env.STRIPE_SECRET_KEY!,
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
          }),
        ],
      },
    }),
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      // Specify which collections should use Vercel Blob
      collections: {
        media: true,
      },
      // Token provided by Vercel once Blob storage is added to your Vercel project
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    // ─── API Documentation (OpenAPI + Scalar) ────────────────
    // ── OpenAPI spec (Payload collections only) at /api/payload-spec.json
    // The unified spec (Payload + custom routes) is served at /api/openapi.json
    openapi({
      openapiVersion: "3.1",
      specEndpoint: "/payload-spec.json",
      metadata: {
        title: "Koffee Kulture API",
        version: "1.0.0",
        description:
          "Menu, ordering, tables, branches, and content management for Koffee Kulture (powered by teslam2eedak).",
      },
    }),
    // Scalar UI is served at /api/docs via a Next.js route handler
  ],
  localization: {
    locales: ["en", "ar", "es"],
    defaultLocale: "en", // The fallback language
    fallback: true, // If a translation is missing, show the default locale
  },
});
