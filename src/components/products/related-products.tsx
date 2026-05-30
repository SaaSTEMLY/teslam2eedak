"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "@/components/Link/customLink";
import { ShoppingBag } from "lucide-react";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface RelatedProduct {
  id: string | number;
  name?: string;
  slug?: string;
  description?: string;
  priceInUSD?: number;
  images?: { url?: string; alt?: string }[];
}

interface RelatedProductsProps {
  productId: string | number;
  locale: string;
  title: string;
  freeLabel: string;
}

export function RelatedProducts({
  productId,
  locale,
  title,
  freeLabel,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);

  useEffect(() => {
    api
      .GET("/api/recommendations/related/{productId}", {
        params: {
          path: { productId: String(productId) },
          query: { limit: 4, locale: locale as "en" | "ar" | "es" },
        },
      })
      .then(({ data }) => {
        if (!data) return;
        const docs = (data.products ?? []).map((p: Record<string, unknown>) => {
          const images = p.images as
            | { url?: string; alt?: string }[]
            | undefined;
          let imageUrl: string | undefined;
          if (images?.[0]?.url) {
            try {
              imageUrl = new URL(images[0].url).pathname;
            } catch {
              imageUrl = images[0].url;
            }
          }
          return {
            id: p.id as number,
            name: p.name as string,
            slug: p.slug as string,
            description: p.description as string,
            priceInUSD: p.priceInUSD as number,
            images: imageUrl
              ? [{ url: imageUrl, alt: images?.[0]?.alt ?? "" }]
              : [],
          };
        });
        setProducts(docs);
      })
      .catch(() => {});
  }, [productId, locale]);

  if (products.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border/50">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-8">
        {title}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => {
          const img = product.images?.[0];
          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted mb-3 relative">
                {img?.url ? (
                  <Image
                    src={img.url}
                    alt={img.alt || product.name || "Product"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="size-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <h3 className="text-sm font-medium text-foreground group-hover:text-muted-foreground transition-colors line-clamp-1">
                {product.name}
              </h3>
              {product.priceInUSD != null && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {product.priceInUSD === 0
                    ? freeLabel
                    : `$${(product.priceInUSD / 100).toFixed(2)}`}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
