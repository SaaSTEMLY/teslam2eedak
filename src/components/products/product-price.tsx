"use client";

import { useMemo } from "react";
import { useCartDiscount } from "@/hooks/use-cart-discount";

interface ProductPriceProps {
  locale: string;
  freeLabel: string;
  fromLabel: string;
  basePrice?: number | null;
  variantPrices?: (number | null | undefined)[];
  className?: string;
}

function formatPrice(
  priceInCents: number | null | undefined,
  locale: string,
  freeLabel: string,
): string {
  if (priceInCents === null || priceInCents === undefined) return freeLabel;
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };
  return new Intl.NumberFormat(localeMap[locale] || locale, {
    style: "currency",
    currency: "USD",
  }).format(priceInCents / 100);
}

export function ProductPrice({
  locale,
  freeLabel,
  fromLabel,
  basePrice,
  variantPrices,
  className,
}: ProductPriceProps) {
  const { discount } = useCartDiscount();

  const priceRange = useMemo(() => {
    const prices = (variantPrices ?? [])
      .filter((p): p is number => typeof p === "number")
      .filter((p) => Number.isFinite(p));

    if (prices.length === 0) {
      return {
        min: basePrice ?? null,
        max: basePrice ?? null,
      };
    }

    const sorted = [...prices].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }, [basePrice, variantPrices]);

  const hasRange =
    priceRange.min != null &&
    priceRange.max != null &&
    priceRange.min !== priceRange.max;

  const getDiscountedPrice = (priceInCents?: number | null) => {
    if (!discount || priceInCents == null || priceInCents <= 0) {
      return {
        original: priceInCents,
        discounted: priceInCents,
        amount: 0,
      };
    }

    let discountAmount = 0;
    if (discount.discountType === "percentage") {
      discountAmount = Math.round(
        (priceInCents * (discount.discountValue ?? 0)) / 100,
      );
      if (
        discount.maxDiscountAmount != null &&
        discount.maxDiscountAmount > 0 &&
        discountAmount > discount.maxDiscountAmount
      ) {
        discountAmount = discount.maxDiscountAmount;
      }
    } else {
      discountAmount = discount.discountValue ?? 0;
    }

    if (discountAmount > priceInCents) {
      discountAmount = priceInCents;
    }

    return {
      original: priceInCents,
      discounted: Math.max(0, priceInCents - discountAmount),
      amount: discountAmount,
    };
  };

  const priceMeta = getDiscountedPrice(priceRange.min ?? null);
  const originalLabel = hasRange
    ? `${fromLabel} ${formatPrice(priceMeta.original, locale, freeLabel)}`
    : formatPrice(priceMeta.original, locale, freeLabel);
  const discountedLabel = hasRange
    ? `${fromLabel} ${formatPrice(priceMeta.discounted, locale, freeLabel)}`
    : formatPrice(priceMeta.discounted, locale, freeLabel);

  if (priceMeta.amount > 0) {
    return (
      <div className={className}>
        <div className="text-xs text-muted-foreground line-through">
          {originalLabel}
        </div>
        <div className="text-sm font-semibold text-foreground">
          {discountedLabel}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <span className="text-sm font-semibold text-foreground">
        {originalLabel}
      </span>
    </div>
  );
}
