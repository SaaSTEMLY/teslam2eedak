import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { notFound } from "next/navigation";
import { createServerApiClient } from "@/lib/api/client";
import { ArrowLeft } from "lucide-react";
import { RichText } from "@/components/blog/rich-text";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { resolveMedia } from "@/lib/utils";
import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";
import { ProductReviews } from "@/components/products/product-reviews";
import { RelatedProducts } from "@/components/products/related-products";
import { SignalTracker } from "@/components/products/signal-tracker";
import { WishlistButton } from "@/components/products/wishlist-button";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

interface VariantOption {
  id: string | number;
  label: string;
  value: string;
}

interface ProductVariant {
  id: string | number;
  title?: string | { en?: string; ar?: string; es?: string } | null;
  images?: unknown[] | null;
  options: (number | VariantOption)[];
  inventory?: number | null;
  priceInUSD?: number | null;
  priceInUSDEnabled?: boolean | null;
  _status?: string | null;
}

interface Product {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  longDescription?: SerializedEditorState | null;
  images?: unknown[] | null;
  category?: string | null;
  featured?: boolean | null;
  priceInUSD?: number | null;
  inventory?: number | null;
  enableVariants?: boolean | null;
  variants?: {
    docs?: (number | ProductVariant)[];
  };
  _status?: string | null;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const m = await getMessages("products");
  const { slug } = await params;

  const locale = await getLocale();

  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/products", {
      params: {
        query: {
          locale,
          where: {
            slug: { equals: slug },
            _status: { equals: "published" },
          },
          limit: 1,
        },
      },
    });

    const product = data?.docs?.[0] as Product | undefined;

    if (!product) {
      return {
        title: m.productNotFoundTitle,
      };
    }

    // Use SEO plugin fields if available, fallback to product fields
    const seo = (
      product as Product & {
        meta?: { title?: string; description?: string; image?: unknown };
      }
    ).meta;
    const seoTitle = seo?.title || `${product.name} | Koffee Kulture`;
    const seoDescription = seo?.description || product.description || undefined;
    const seoImage =
      resolveMedia(seo?.image) ?? resolveMedia(product.images?.[0]);

    return {
      title: seoTitle,
      description: seoDescription,
      openGraph: {
        ...baseMetadata.openGraph,
        title: seoTitle,
        description: seoDescription,
        type: "website",
        ...(seoImage ? { images: [{ url: seoImage.url }] } : {}),
      },
    };
  } catch {
    return {
      title: m.productNotFoundTitle,
    };
  }
}

export async function generateStaticParams() {
  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/products", {
      params: {
        query: {
          where: {
            _status: { equals: "published" },
          },
          limit: 100,
        },
      },
    });

    return ((data?.docs ?? []) as Product[])
      .filter((product) => product.slug)
      .map((product) => ({
        slug: product.slug as string,
      }));
  } catch {
    return [];
  }
}

function getCategoryLabel(
  category: string | null | undefined,
  messages: { [key: string]: string },
): string {
  if (!category) return "";
  const key = `category${category.charAt(0).toUpperCase()}${category.slice(1)}`;
  return messages[key] || category;
}

function getLocalizedTitle(
  title: string | { en?: string; ar?: string; es?: string } | null | undefined,
  locale: string,
): string {
  if (!title) return "";
  if (typeof title === "string") return title;
  return title[locale as "en" | "ar" | "es"] || title.en || "";
}

export default async function ProductPage({ params }: ProductPageProps) {
  const m = await getMessages("products");
  const reviewMessages = await getMessages("reviews");
  const wishlistMessages = await getMessages("wishlist");
  const { slug } = await params;
  const cookieStore = await cookies();
  const hasSession = cookieStore.has("better-auth.session_token");

  let product: Product | null = null;

  const locale = await getLocale();

  try {
    const api = await createServerApiClient();
    const { data } = await api.GET("/api/products", {
      params: {
        query: {
          locale,
          where: {
            slug: { equals: slug },
            _status: { equals: "published" },
          },
          limit: 1,
          depth: 1,
        },
      },
    });

    product = (data?.docs?.[0] as Product) || null;

    if (product?.enableVariants) {
      const { data: variantData } = await api.GET("/api/variants", {
        params: {
          query: {
            locale,
            where: {
              product: { equals: product.id },
              _status: { equals: "published" },
            },
            limit: 50,
            depth: 2,
          },
        },
      });
      product.variants = {
        docs: (variantData?.docs ?? []) as ProductVariant[],
      };
    }
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  const hasVariants =
    product.enableVariants &&
    product.variants?.docs &&
    product.variants.docs.length > 0;
  const variants = hasVariants
    ? (
        product.variants!.docs!.filter(
          (v) => typeof v !== "number",
        ) as ProductVariant[]
      ).map((v) => ({
        id: v.id,
        title: getLocalizedTitle(v.title, locale),
        priceInUSD: v.priceInUSDEnabled ? v.priceInUSD : product.priceInUSD,
        inventory: v.inventory,
        options: (v.options || [])
          .filter((o): o is VariantOption => typeof o !== "number")
          .map((o) => ({ id: o.id, label: o.label, value: o.value })),
        images: (v.images || [])
          .map((img) => resolveMedia(img))
          .filter((img): img is { url: string; alt: string } => img !== null),
      }))
    : [];

  const productImages = (product.images || [])
    .map((img) => resolveMedia(img))
    .filter((img): img is { url: string; alt: string } => img !== null);

  const isInStock =
    product.inventory === null ||
    product.inventory === undefined ||
    product.inventory > 0;

  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: `${baseUrl}/products/${product.slug}`,
    ...(productImages[0] ? { image: `${baseUrl}${productImages[0].url}` } : {}),
    offers: {
      "@type": "Offer",
      price: product.priceInUSD ? (product.priceInUSD / 100).toFixed(2) : "0",
      priceCurrency: "USD",
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          {m.backToProducts}
        </Link>

        <SignalTracker productId={product.id} />

        <div className="relative">
          <div className="absolute top-0 end-0">
            <WishlistButton
              productId={product.id}
              isAuthenticated={hasSession}
              translations={{
                addedToWishlist: wishlistMessages.addedToWishlist,
                removedFromWishlist: wishlistMessages.removedFromWishlist,
                saveForLater: wishlistMessages.saveForLater,
                removeFromWishlist: wishlistMessages.removeFromWishlist,
                loginToSave: wishlistMessages.loginToSave,
              }}
            />
          </div>

          <ProductDetailClient
            productId={product.id}
            productName={product.name || "Product"}
            description={product.description}
            category={getCategoryLabel(product.category, m)}
            defaultPrice={product.priceInUSD}
            isInStock={isInStock}
            productImages={productImages}
            variants={variants}
            locale={locale}
            translations={{
              selectTier: m.selectTier,
              soldOut: m.soldOut,
              oneTime: m.oneTime,
              inStock: m.inStock,
              outOfStock: m.outOfStock,
              quantity: m.quantity,
              decreaseQuantity: m.decreaseQuantity,
              increaseQuantity: m.increaseQuantity,
              addedToCart: m.addedToCart,
              addToCart: m.addToCart,
              free: m.free,
              whatsIncluded: m.whatsIncluded,
              lifetimeAccess: m.lifetimeAccess,
              moneyBackGuarantee: m.moneyBackGuarantee,
              prioritySupport: m.prioritySupport,
            }}
          />
        </div>

        {product.longDescription && (
          <div className="mt-20 pt-16 border-t border-border/50">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-8">
              {m.detailsHeading}
            </h2>
            <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-li:text-muted-foreground prose-ul:my-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
              <RichText data={product.longDescription} />
            </article>
          </div>
        )}

        <div className="mt-20 pt-16 border-t border-border/50">
          <ProductReviews
            productId={product.id}
            isAuthenticated={hasSession}
            translations={reviewMessages}
          />
        </div>

        <RelatedProducts
          productId={product.id}
          locale={locale}
          title={m.browseMore}
          freeLabel={m.free}
        />

        <div className="mt-20 pt-8 border-t border-border/50 flex items-center justify-between">
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {m.browseMore}
          </Link>
          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {m.needHelp}
          </Link>
        </div>
      </div>
    </main>
  );
}
