"use client";

import { useState } from "react";
import { ProductGallery } from "./product-gallery";
import { ProductAddToCart } from "./product-add-to-cart";

interface ProductImage {
  url: string;
  alt: string;
}

interface VariantData {
  id: string | number;
  title: string;
  priceInUSD?: number | null;
  inventory?: number | null;
  options: { id: string | number; label: string; value: string }[];
  images: ProductImage[];
}

interface ProductDetailClientProps {
  productId: string | number;
  productName: string;
  description?: string | null;
  category?: string | null;
  defaultPrice?: number | null;
  isInStock: boolean;
  productImages: ProductImage[];
  variants: VariantData[];
  locale: string;
  translations: {
    selectTier: string;
    soldOut: string;
    oneTime: string;
    inStock: string;
    outOfStock: string;
    quantity: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    addedToCart: string;
    addToCart: string;
    free: string;
    whatsIncluded: string;
    lifetimeAccess: string;
    moneyBackGuarantee: string;
    prioritySupport: string;
  };
}

export function ProductDetailClient({
  productId,
  productName,
  description,
  category,
  defaultPrice,
  isInStock,
  productImages,
  variants,
  locale,
  translations: t,
}: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | number | null
  >(variants.length > 0 ? variants[0]!.id : null);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  // Show variant images if the selected variant has any, otherwise show product images
  const displayImages =
    selectedVariant && selectedVariant.images.length > 0
      ? selectedVariant.images
      : productImages;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
      <ProductGallery images={displayImages} productName={productName} />

      <div className="flex flex-col">
        {category && (
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
            {category}
          </span>
        )}

        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-foreground">
          {productName}
        </h1>

        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>

        <div className="mt-6">
          <ProductAddToCart
            product={{ id: productId }}
            isInStock={isInStock}
            defaultPrice={defaultPrice}
            variants={variants}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
            locale={locale}
            translations={t}
          />
        </div>
      </div>
    </div>
  );
}
