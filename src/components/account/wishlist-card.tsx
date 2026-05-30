"use client";

import { useState, useEffect } from "react";
import Link from "@/components/Link/customLink";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { toast } from "sonner";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface WishlistItem {
  id: number;
  product?: {
    id: number;
    name?: string;
    slug?: string;
    priceInUSD?: number;
    images?: { url?: string; alt?: string }[];
  };
  addedAt?: string;
}

interface WishlistCardProps {
  translations: {
    wishlistTitle: string;
    wishlistDescription: string;
    emptyWishlist: string;
    emptyWishlistDescription: string;
    browseProducts: string;
    removedFromWishlist: string;
    viewProduct: string;
    moveToCart: string;
    addToCart: string;
    added: string;
  };
}

export function WishlistCard({ translations: t }: WishlistCardProps) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .GET("/api/wishlist")
      .then(({ data }) => setItems((data?.items as WishlistItem[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const removeItem = async (itemId: number) => {
    try {
      await api.DELETE("/api/wishlist/{itemId}", {
        params: { path: { itemId: String(itemId) } },
      });
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success(t.removedFromWishlist);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
          <Heart className="size-5" />
          {t.wishlistTitle}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t.wishlistDescription}
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          ...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border/50 p-8 text-center">
          <Heart className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium text-foreground">{t.emptyWishlist}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t.emptyWishlistDescription}
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/products">{t.browseProducts}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const product = item.product;
            if (!product || typeof product === "number") return null;

            let imageUrl: string | undefined;
            const firstImage = product.images?.[0];
            if (
              firstImage &&
              typeof firstImage === "object" &&
              firstImage.url
            ) {
              try {
                imageUrl = new URL(firstImage.url).pathname;
              } catch {
                imageUrl = firstImage.url;
              }
            }

            return (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-border/50 p-4"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="relative size-16 rounded-lg overflow-hidden bg-muted shrink-0"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name ?? "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="size-5 text-muted-foreground/30" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-medium text-foreground hover:text-muted-foreground transition-colors text-sm"
                  >
                    {product.name}
                  </Link>
                  {product.priceInUSD != null && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {product.priceInUSD === 0
                        ? "Free"
                        : `$${(product.priceInUSD / 100).toFixed(2)}`}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <AddToCartButton
                    product={{ id: product.id }}
                    translations={{
                      addToCart: t.moveToCart,
                      added: t.added,
                    }}
                    variant="outline"
                    showIcon={false}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
