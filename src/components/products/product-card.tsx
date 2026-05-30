import Image from "next/image";
import Link from "@/components/Link/customLink";
import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductPrice } from "@/components/products/product-price";
import { resolveMedia } from "@/lib/utils";
import { StarRating } from "./star-rating";

interface ProductVariant {
  id: string | number;
  images?: unknown[] | null;
  priceInUSD?: number | null;
  priceInUSDEnabled?: boolean | null;
  inventory?: number | null;
}

export interface ProductCardData {
  id: string | number;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  images?: unknown[] | null;
  category?: string | null;
  featured?: boolean | null;
  priceInUSD?: number | null;
  enableVariants?: boolean | null;
  _variants?: ProductVariant[];
  averageRating?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  locale: string;
  translations: {
    featured: string;
    selectOptions: string;
    addToCart: string;
    added: string;
    details: string;
    free: string;
    from: string;
  };
  getCategoryLabel: (category: string | null | undefined) => string;
  showRating?: boolean;
}

export function ProductCard({
  product,
  locale,
  translations: t,
  getCategoryLabel,
  showRating = false,
}: ProductCardProps) {
  const img =
    resolveMedia(product.images?.[0]) ??
    resolveMedia(product._variants?.find((v) => v.images?.length)?.images?.[0]);

  return (
    <article className="group">
      <Link
        href={`/products/${product.slug}`}
        className="block aspect-video w-full overflow-hidden rounded-xl bg-muted mb-4 relative"
      >
        {img ? (
          <Image
            src={img.url}
            alt={img.alt || product.name || "Product"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="size-10 text-muted-foreground/30" />
          </div>
        )}
        {product.featured && (
          <Badge className="absolute top-3 start-3 bg-foreground text-background text-xs">
            {t.featured}
          </Badge>
        )}
      </Link>

      <div className="flex items-center justify-between mb-2">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {getCategoryLabel(product.category)}
          </span>
        )}
        <ProductPrice
          locale={locale}
          freeLabel={t.free}
          fromLabel={t.from}
          basePrice={product.priceInUSD}
          variantPrices={(product._variants || []).map((variant) =>
            variant.priceInUSDEnabled && variant.priceInUSD != null
              ? variant.priceInUSD
              : product.priceInUSD,
          )}
          className="text-right"
        />
      </div>

      <h2 className="text-lg font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
        <Link href={`/products/${product.slug}`}>{product.name}</Link>
      </h2>

      {showRating &&
        product.averageRating != null &&
        product.averageRating > 0 && (
          <div className="mt-1">
            <StarRating rating={product.averageRating} size="sm" />
          </div>
        )}

      <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {product.description}
      </p>

      <div className="mt-4 flex items-center gap-3">
        {product.enableVariants &&
        product._variants &&
        product._variants.length > 0 ? (
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            {t.selectOptions}
          </Link>
        ) : (
          <>
            <AddToCartButton
              product={{ id: product.id }}
              className="flex-1"
              translations={{
                addToCart: t.addToCart,
                added: t.added,
              }}
            />
            <Link
              href={`/products/${product.slug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.details}
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
