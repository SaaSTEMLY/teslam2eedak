"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  CheckCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { cn } from "@/lib/utils";
import { useCartDiscount } from "@/hooks/use-cart-discount";

interface VariantData {
  id: string | number;
  title: string;
  priceInUSD?: number | null;
  inventory?: number | null;
  options: { id: string | number; label: string; value: string }[];
}

interface ProductAddToCartProps {
  product: {
    id: string | number;
  };
  isInStock: boolean;
  defaultPrice?: number | null;
  variants?: VariantData[];
  selectedVariantId?: string | number | null;
  onVariantChange?: (variantId: string | number) => void;
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
  };
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

function formatNumber(num: number, locale: string): string {
  const localeMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    ar: "ar-SA",
  };
  return new Intl.NumberFormat(localeMap[locale] || locale).format(num);
}

export function ProductAddToCart({
  product,
  isInStock: defaultInStock,
  defaultPrice,
  variants = [],
  selectedVariantId: controlledVariantId,
  onVariantChange,
  locale,
  translations: t,
}: ProductAddToCartProps) {
  const { addItem } = useCart();
  const { openCart } = useCartDrawer();
  const { discount } = useCartDiscount();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [internalVariantId, setInternalVariantId] = useState<
    string | number | null
  >(variants.length > 0 ? variants[0]!.id : null);

  const isControlled = controlledVariantId !== undefined;
  const selectedVariantId = isControlled
    ? controlledVariantId
    : internalVariantId;
  const setSelectedVariantId = (id: string | number) => {
    if (!isControlled) setInternalVariantId(id);
    onVariantChange?.(id);
  };

  const hasVariants = variants.length > 0;
  const selectedVariant = hasVariants
    ? (variants.find((v) => v.id === selectedVariantId) ?? null)
    : null;

  const currentPrice = selectedVariant
    ? selectedVariant.priceInUSD
    : defaultPrice;

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

  const currentPriceMeta = getDiscountedPrice(currentPrice);

  const isInStock = selectedVariant
    ? selectedVariant.inventory === null ||
      selectedVariant.inventory === undefined ||
      selectedVariant.inventory > 0
    : defaultInStock;

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = async () => {
    if (!isInStock) return;

    await addItem(
      {
        product: Number(product.id),
        ...(selectedVariant ? { variant: Number(selectedVariant.id) } : {}),
      },
      quantity,
    );
    openCart();

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuantity(1);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Variant Selector */}
      {hasVariants && (
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            {t.selectTier}
          </label>
          <div className="grid gap-2">
            {variants.map((variant) => {
              const selected = selectedVariantId === variant.id;
              const variantInStock =
                variant.inventory === null ||
                variant.inventory === undefined ||
                variant.inventory > 0;

              return (
                <Button
                  key={variant.id}
                  variant="ghost"
                  size="clear"
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={!variantInStock}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/50 hover:bg-accent/50",
                    !variantInStock && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-4 rounded-full border-2 flex items-center justify-center transition-colors",
                        selected
                          ? "border-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {selected && (
                        <div className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium",
                        selected ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {variant.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {variantInStock
                      ? (() => {
                          const priceMeta = getDiscountedPrice(
                            variant.priceInUSD,
                          );
                          if (priceMeta.amount > 0) {
                            return (
                              <span className="flex flex-col items-end">
                                <span className="text-xs text-muted-foreground line-through">
                                  {formatPrice(
                                    priceMeta.original,
                                    locale,
                                    t.free,
                                  )}
                                </span>
                                <span>
                                  {formatPrice(
                                    priceMeta.discounted,
                                    locale,
                                    t.free,
                                  )}
                                </span>
                              </span>
                            );
                          }

                          return (
                            <span>
                              {formatPrice(priceMeta.original, locale, t.free)}
                            </span>
                          );
                        })()
                      : t.soldOut}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        {currentPriceMeta.amount > 0 ? (
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(currentPriceMeta.original, locale, t.free)}
            </span>
            <span className="text-4xl font-bold text-primary leading-tight">
              {formatPrice(currentPriceMeta.discounted, locale, t.free)}
            </span>
          </div>
        ) : (
          <span className="text-4xl font-bold text-primary">
            {formatPrice(currentPrice, locale, t.free)}
          </span>
        )}
        {currentPriceMeta.discounted && currentPriceMeta.discounted > 0 && (
          <span className="text-sm text-muted-foreground">{t.oneTime}</span>
        )}
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        {isInStock ? (
          <>
            <CheckCircle className="size-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              {t.inStock}
            </span>
          </>
        ) : (
          <>
            <Package className="size-5 text-orange-500" />
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              {t.outOfStock}
            </span>
          </>
        )}
      </div>

      {/* Quantity + Add to Cart */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">
          {t.quantity}
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Quantity Selector */}
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <Button
              variant="ghost"
              size="clear"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || !isInStock}
              className="size-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed"
              aria-label={t.decreaseQuantity}
            >
              <Minus className="size-4" />
            </Button>
            <span className="w-12 text-center font-medium text-foreground">
              {formatNumber(quantity, locale)}
            </span>
            <Button
              variant="ghost"
              size="clear"
              onClick={incrementQuantity}
              disabled={!isInStock}
              className="size-12 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed"
              aria-label={t.increaseQuantity}
            >
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={
              !isInStock || isAdded || (hasVariants && !selectedVariant)
            }
            size="lg"
            className={cn(
              "flex-1 h-12 gap-2 text-base font-semibold transition-all",
              isAdded && "bg-green-600 hover:bg-green-600",
            )}
          >
            {isAdded ? (
              <>
                <Check className="size-5" />
                {t.addedToCart}
              </>
            ) : (
              <>
                <ShoppingBag className="size-5" />
                {isInStock ? t.addToCart : t.outOfStock}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
