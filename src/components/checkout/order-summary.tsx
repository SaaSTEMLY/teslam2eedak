"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingBag, Tag, X, Loader2 } from "lucide-react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product, Variant } from "@/payload-types";
import { resolveMedia } from "@/lib/utils";
import type { Messages } from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/locale";

import type { DiscountInfo } from "@/hooks/use-cart-discount";

interface OrderSummaryProps {
  discount?: DiscountInfo | null;
  onApplyDiscount?: (code: string) => Promise<boolean> | boolean;
  onRemoveDiscount?: () => Promise<void> | void;
  isValidatingDiscount?: boolean;
  discountError?: string | null;
  onClearDiscountError?: () => void;
  translations: Messages<"checkout">;
  locale: SupportedLocale;
}

export function OrderSummary({
  discount,
  onApplyDiscount,
  onRemoveDiscount,
  isValidatingDiscount = false,
  discountError,
  onClearDiscountError,
  translations: m,
  locale,
}: OrderSummaryProps) {
  const { cart } = useCart();

  const [codeInput, setCodeInput] = useState("");

  const items = cart?.items ?? [];
  const subtotal = (cart as { subtotal?: number | null })?.subtotal ?? 0;
  const discountAmount = discount?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discountAmount);

  // Number formatter for localized numbers with proper numbering system
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(locale, {
      numberingSystem: locale === "ar" ? "arab" : "latn",
    }).format(num);
  };

  // Localized currency formatter with proper numbering system (amount is in cents)
  const formatLocalizedCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      numberingSystem: locale === "ar" ? "arab" : "latn",
    }).format(amount / 100);
  };

  const handleApplyCode = async () => {
    const trimmed = codeInput.trim();
    if (!trimmed) return;

    onClearDiscountError?.();

    try {
      const applied = await onApplyDiscount?.(trimmed);
      if (applied) {
        setCodeInput("");
      }
    } catch {
      // Errors are handled by the parent hook
    }
  };

  const handleRemoveDiscount = () => {
    onRemoveDiscount?.();
    onClearDiscountError?.();
  };

  const discountLabel = discount
    ? discount.discountType === "percentage"
      ? m.discountPercentageLabel.replace(
          "{percentage}",
          formatNumber(discount.discountValue),
        )
      : m.discountFlatLabel.replace(
          "{amount}",
          formatLocalizedCurrency(discount.discountValue),
        )
    : "";

  return (
    <div className="sticky top-32 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground mb-4">
        {m.orderSummary}
      </h2>

      <ul className="space-y-4 mb-6">
        {items.map((item) => {
          const product =
            typeof item.product === "object" ? (item.product as Product) : null;
          const variant =
            typeof item.variant === "object" ? (item.variant as Variant) : null;
          const name = product?.name ?? "Product";
          const variantLabel = variant?.title;
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

          return (
            <li key={item.id} className="flex gap-3">
              {image ? (
                <div className="relative size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={image.url}
                    alt={image.alt || name}
                    fill
                    className="object-cover"
                  />
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {formatNumber(item.quantity)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="size-14 rounded-lg bg-muted flex items-center justify-center shrink-0 relative">
                  <ShoppingBag className="size-6 text-muted-foreground/50" />
                  {item.quantity > 1 && (
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                      {formatNumber(item.quantity)}
                    </span>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-1">
                  {name}
                </p>
                {variantLabel && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {variantLabel}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {m.quantity.replace(
                    "{quantity}",
                    formatNumber(item.quantity),
                  )}
                </p>
              </div>

              {discount && lineDiscount > 0 ? (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground line-through">
                    {formatLocalizedCurrency(lineSubtotal)}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatLocalizedCurrency(lineTotal)}
                  </p>
                </div>
              ) : (
                <p className="text-sm font-semibold text-foreground">
                  {formatLocalizedCurrency(lineSubtotal)}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Discount Code Input */}
      {onApplyDiscount && !discount && (
        <div className="mb-4 pb-4 border-b border-border/50">
          <div className="flex gap-2">
            <Input
              placeholder={m.discountCodePlaceholder}
              aria-label={m.discountCode}
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                if (discountError) onClearDiscountError?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApplyCode();
                }
              }}
              disabled={isValidatingDiscount}
              className="h-9 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplyCode}
              disabled={isValidatingDiscount || !codeInput.trim()}
              className="h-9 px-4 shrink-0"
            >
              {isValidatingDiscount ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                m.apply
              )}
            </Button>
          </div>
          {discountError && (
            <p className="text-xs text-destructive mt-1.5">{discountError}</p>
          )}
        </div>
      )}

      <div className="border-t border-border/50 pt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{m.subtotal}</span>
          <span className="font-medium text-foreground">
            {formatLocalizedCurrency(subtotal)}
          </span>
        </div>

        {/* Applied Discount */}
        {discount && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <Tag className="size-3.5" />
              <span>{discount.code}</span>
              <span className="text-xs text-muted-foreground">
                ({discountLabel})
              </span>
              {onRemoveDiscount && (
                <Button
                  variant="ghost"
                  size="clear"
                  onClick={handleRemoveDiscount}
                  className="ms-1 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={m.removeDiscount}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </span>
            <span className="font-medium text-emerald-600">
              -{formatLocalizedCurrency(discountAmount)}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-base pt-2 border-t border-border/50">
          <span className="font-semibold text-foreground">{m.total}</span>
          <span className="font-bold text-primary text-lg">
            {formatLocalizedCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
