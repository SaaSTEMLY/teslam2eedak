"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import Link from "@/components/Link/customLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import type { Product, Variant, VariantOption } from "@/payload-types";
import { resolveMedia, cn } from "@/lib/utils";
import { useCartDiscount } from "@/hooks/use-cart-discount";

interface CartDrawerProps {
  locale: string;
  translations: {
    yourCart: string;
    item: string;
    items: string;
    cartEmpty: string;
    addProducts: string;
    browseProducts: string;
    decreaseQuantity: string;
    increaseQuantity: string;
    removeItem: string;
    subtotal: string;
    discountCode: string;
    discountCodePlaceholder: string;
    discountPercentageLabel: string;
    discountFlatLabel: string;
    apply: string;
    total: string;
    removeDiscount: string;
    errorInvalidDiscount: string;
    errorValidatingDiscount: string;
    proceedToCheckout: string;
    continueShopping: string;
  };
}

function formatPrice(priceInCents: number, locale: string): string {
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

export function CartDrawer({ locale, translations: t }: CartDrawerProps) {
  const { cart, removeItem, incrementItem, decrementItem, isLoading } =
    useCart();
  const { isOpen, closeCart } = useCartDrawer();
  const {
    discount,
    applyDiscountCode,
    removeDiscount,
    isValidating: isDiscountValidating,
    error: discountError,
    clearError: clearDiscountError,
  } = useCartDiscount({
    invalid: t.errorInvalidDiscount,
    validating: t.errorValidatingDiscount,
  });
  const [codeInput, setCodeInput] = useState("");

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = (cart as { subtotal?: number | null })?.subtotal ?? 0;
  const discountAmount = discount?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  const isRTL = locale === "ar";

  const discountLabel = discount
    ? discount.discountType === "percentage"
      ? t.discountPercentageLabel.replace(
          "{percentage}",
          formatNumber(discount.discountValue, locale),
        )
      : t.discountFlatLabel.replace(
          "{amount}",
          formatPrice(discount.discountValue, locale),
        )
    : "";

  const handleApplyDiscount = async () => {
    const trimmed = codeInput.trim();
    if (!trimmed) return;
    const applied = await applyDiscountCode(trimmed);
    if (applied) {
      setCodeInput("");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className={cn("flex flex-col w-full sm:max-w-md", {
          "[&[data-state=open]]:animate-in [&[data-state=open]]:slide-in-from-left [&[data-state=closed]]:animate-out [&[data-state=closed]]:slide-out-to-left":
            isRTL,
        })}
      >
        <SheetHeader className="border-b border-border/50 pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif">
            <ShoppingBag className="size-5" />
            {t.yourCart}
            {itemCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({formatNumber(itemCount, locale)}{" "}
                {itemCount === 1 ? t.item : t.items})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
              {t.cartEmpty}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t.addProducts}
            </p>
            <Button onClick={closeCart} asChild>
              <Link href="/products">{t.browseProducts}</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 -mx-6 px-6">
              <ul className="space-y-4">
                {items.map((item) => {
                  const product =
                    typeof item.product === "object" && item.product !== null
                      ? (item.product as Product)
                      : null;
                  const variant =
                    typeof item.variant === "object" && item.variant !== null
                      ? (item.variant as Variant)
                      : null;
                  const name = product?.name ?? "Product";
                  const variantLabel =
                    variant?.options
                      ?.map((opt) =>
                        typeof opt === "object" && opt !== null
                          ? (opt as VariantOption).label
                          : null,
                      )
                      .filter(Boolean)
                      .join(" / ") || variant?.title;
                  const price = variant?.priceInUSD ?? product?.priceInUSD ?? 0;
                  const lineSubtotal = price * item.quantity;
                  const lineDiscount =
                    discount && subtotal > 0
                      ? Math.round((lineSubtotal / subtotal) * discountAmount)
                      : 0;
                  const lineTotal = Math.max(0, lineSubtotal - lineDiscount);
                  const image =
                    resolveMedia(variant?.images?.[0]) ??
                    resolveMedia(product?.images?.[0]);
                  const slug = product?.slug ?? "";

                  return (
                    <li
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl bg-muted/30 border border-border/50"
                    >
                      {/* Product Image */}
                      {image ? (
                        <div className="relative size-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={image.url}
                            alt={image.alt || name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <ShoppingBag className="size-8 text-muted-foreground/50" />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${slug}`}
                          onClick={closeCart}
                          className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {name}
                        </Link>
                        {variantLabel && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {variantLabel}
                          </p>
                        )}
                        {discount && lineDiscount > 0 ? (
                          <div className="mt-0.5">
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPrice(lineSubtotal, locale)}
                            </p>
                            <p className="text-sm text-primary font-semibold">
                              {formatPrice(lineTotal, locale)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-primary font-semibold mt-0.5">
                            {formatPrice(lineSubtotal, locale)}
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => item.id && decrementItem(item.id)}
                              disabled={isLoading}
                              className="size-7 hover:bg-accent"
                              aria-label={t.decreaseQuantity}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {formatNumber(item.quantity, locale)}
                            </span>
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => item.id && incrementItem(item.id)}
                              disabled={isLoading}
                              className="size-7 hover:bg-accent"
                              aria-label={t.increaseQuantity}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="clear"
                            onClick={() => item.id && removeItem(item.id)}
                            disabled={isLoading}
                            className="text-muted-foreground hover:text-destructive p-1"
                            aria-label={t.removeItem}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 pt-4 space-y-4">
              {!discount && (
                <div>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t.discountCodePlaceholder}
                      aria-label={t.discountCode}
                      value={codeInput}
                      onChange={(e) => {
                        setCodeInput(e.target.value);
                        if (discountError) clearDiscountError();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyDiscount();
                        }
                      }}
                      disabled={isDiscountValidating || isLoading}
                      className="h-9 text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyDiscount}
                      disabled={
                        isDiscountValidating || isLoading || !codeInput.trim()
                      }
                      className="h-9 px-4 shrink-0"
                    >
                      {isDiscountValidating ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        t.apply
                      )}
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-xs text-destructive mt-1.5">
                      {discountError}
                    </p>
                  )}
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>

              {discount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <Tag className="size-3.5" />
                    <span>{discount.code}</span>
                    <span className="text-xs text-muted-foreground">
                      ({discountLabel})
                    </span>
                    <Button
                      variant="ghost"
                      size="clear"
                      onClick={removeDiscount}
                      className="ms-1 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={t.removeDiscount}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </span>
                  <span className="font-medium text-emerald-600">
                    -{formatPrice(discountAmount, locale)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.total}</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(total, locale)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button className="w-full h-11" size="lg" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  {t.proceedToCheckout}
                </Link>
              </Button>

              {/* Continue Shopping */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={closeCart}
                asChild
              >
                <Link href="/products">{t.continueShopping}</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
