"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "@/components/Link/customLink";
import {
  Package,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Hash,
  Calendar,
  CreditCard,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";
import type { Order, Product, Variant } from "@/payload-types";

const api = createBrowserApiClient();
import { resolveMedia } from "@/lib/utils";
import type accountEn from "@/messages/account/en";
import type { SupportedLocale } from "@/lib/locale";

type OrderWithProducts = Order & {
  fulfillmentStatus?: string | null;
  items?:
    | {
        product?: Product | number | null;
        variant?: Variant | number | null;
        quantity: number;
        id?: string | null;
      }[]
    | null;
};

const statusConfig = {
  pending: {
    labelKey: "statusPending" as const,
    icon: Clock,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    dot: "bg-slate-500",
  },
  processing: {
    labelKey: "statusProcessing" as const,
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  shipped: {
    labelKey: "statusShipped" as const,
    icon: Truck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  delivered: {
    labelKey: "statusDelivered" as const,
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  completed: {
    labelKey: "statusCompleted" as const,
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    labelKey: "statusCancelled" as const,
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
  refunded: {
    labelKey: "statusRefunded" as const,
    icon: RotateCcw,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
} as const;

const fulfillmentSteps = [
  "pending",
  "processing",
  "shipped",
  "delivered",
] as const;

function formatCurrency(amount: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EGP",
    numberingSystem: locale === "ar" ? "arab" : undefined,
  }).format(amount / 100);
}

function formatDate(dateString: string, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    numberingSystem: locale === "ar" ? "arab" : undefined,
  }).format(new Date(dateString));
}

function formatDateLong(dateString: string, locale: SupportedLocale) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    numberingSystem: locale === "ar" ? "arab" : undefined,
  }).format(new Date(dateString));
}

function formatNumber(num: number, locale: SupportedLocale) {
  return new Intl.NumberFormat(locale, {
    numberingSystem: locale === "ar" ? "arab" : undefined,
  }).format(num);
}

function getVariantLabel(variant: Variant | null): string | undefined {
  if (!variant) return undefined;
  // Prefer building label from populated options (e.g. "Red / Large")
  if (variant.options?.length) {
    const labels = variant.options
      .map((opt) =>
        typeof opt === "object" && opt !== null ? opt.label : null,
      )
      .filter(Boolean);
    if (labels.length) return labels.join(" / ");
  }
  // Fall back to admin title if options aren't populated
  return variant.title ?? undefined;
}

function StatusBadge({
  status,
  translations,
}: {
  status: string | null | undefined;
  translations: typeof accountEn;
}) {
  const config =
    statusConfig[(status as keyof typeof statusConfig) ?? "processing"] ??
    statusConfig.processing;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border",
        config.color,
        config.bg,
        config.border,
      )}
    >
      <Icon className="size-3" />
      {translations[config.labelKey]}
    </span>
  );
}

function OrderRow({
  order,
  onClick,
  translations,
  locale,
}: {
  order: OrderWithProducts;
  onClick: () => void;
  translations: typeof accountEn;
  locale: SupportedLocale;
}) {
  const itemCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const firstItem = order.items?.[0];
  const firstProduct =
    typeof firstItem?.product === "object" && firstItem.product !== null
      ? firstItem.product
      : null;
  const firstVariant =
    typeof firstItem?.variant === "object" && firstItem.variant !== null
      ? (firstItem.variant as Variant)
      : null;
  const productName = firstProduct?.name ?? null;
  const productImage =
    resolveMedia(firstVariant?.images?.[0]) ??
    resolveMedia(firstProduct?.images?.[0]) ??
    null;

  const itemLabel =
    itemCount === 1
      ? (productName ?? `${formatNumber(1, locale)} ${translations.item}`)
      : `${formatNumber(itemCount, locale)} ${translations.items}`;

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/30 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-200 w-full text-left cursor-pointer"
    >
      {/* Product Thumbnail */}
      {productImage ? (
        <div className="relative size-12 rounded-lg overflow-hidden bg-muted shrink-0">
          <Image
            src={productImage.url}
            alt={productImage.alt || productName || "Product"}
            fill
            className="object-cover"
          />
          {itemCount > 1 && (
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {formatNumber(itemCount, locale)}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center size-12 rounded-lg bg-muted/60 shrink-0 relative">
          <Package className="size-5 text-muted-foreground" />
          {itemCount > 1 && (
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {formatNumber(itemCount, locale)}
            </span>
          )}
        </div>
      )}

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">
            {itemLabel}
          </span>
          <StatusBadge
            status={order.fulfillmentStatus || order.status}
            translations={translations}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-mono">
            #{formatNumber(Number(order.id), locale)}
          </span>
          <span className="mx-1.5 text-border">|</span>
          {formatDate(order.createdAt, locale)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {order.amount ? formatCurrency(order.amount, locale) : "--"}
        </p>
      </div>

      {/* Chevron */}
      <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
    </button>
  );
}

function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  translations,
  locale,
}: {
  order: OrderWithProducts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: typeof accountEn;
  locale: SupportedLocale;
}) {
  if (!order) return null;

  const items = order.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Package className="size-5 text-primary" />
            {translations.orderDetails}
          </DialogTitle>
          <DialogDescription>
            {translations.orderNumber}{" "}
            <span className="font-mono font-medium">
              #{formatNumber(Number(order.id), locale)}
            </span>{" "}
            {translations.placedOn} {formatDateLong(order.createdAt, locale)}
          </DialogDescription>
        </DialogHeader>

        {/* Status + Amount Summary */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {translations.status}
            </p>
            <StatusBadge
              status={order.fulfillmentStatus || order.status}
              translations={translations}
            />
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">
              {translations.total}
            </p>
            <p className="text-lg font-bold text-primary">
              {order.amount ? formatCurrency(order.amount, locale) : "--"}
            </p>
          </div>
        </div>

        {/* Fulfillment Timeline */}
        {order.fulfillmentStatus && order.fulfillmentStatus !== "cancelled" && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              {translations.orderTimeline}
            </h4>
            <div className="flex items-center gap-1">
              {fulfillmentSteps.map((step, idx) => {
                const stepIdx = fulfillmentSteps.indexOf(
                  order.fulfillmentStatus as (typeof fulfillmentSteps)[number],
                );
                const isActive = idx <= stepIdx;
                const stepConfig = statusConfig[step];
                return (
                  <div
                    key={step}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center transition-colors",
                        isActive ? stepConfig.bg : "bg-muted",
                      )}
                    >
                      <stepConfig.icon
                        className={cn(
                          "size-3.5",
                          isActive
                            ? stepConfig.color
                            : "text-muted-foreground/40",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium text-center leading-tight",
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                      )}
                    >
                      {translations[stepConfig.labelKey]}
                    </span>
                    {idx < fulfillmentSteps.length - 1 && (
                      <div
                        className={cn(
                          "absolute h-0.5 top-3.5",
                          isActive && idx < stepIdx
                            ? "bg-primary/30"
                            : "bg-border",
                        )}
                        style={{ display: "none" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60 transition-all duration-500"
                style={{
                  width: `${((fulfillmentSteps.indexOf(order.fulfillmentStatus as (typeof fulfillmentSteps)[number]) + 1) / fulfillmentSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShoppingBag className="size-4 text-muted-foreground" />
            {translations.items} ({formatNumber(items.length, locale)})
          </h4>
          <div className="space-y-3">
            {items.map((item, idx) => {
              const product =
                typeof item.product === "object" && item.product !== null
                  ? item.product
                  : null;
              const variant =
                typeof item.variant === "object" && item.variant !== null
                  ? (item.variant as Variant)
                  : null;
              const name = product?.name ?? "Product";
              const variantLabel = getVariantLabel(variant);
              const image =
                resolveMedia(variant?.images?.[0]) ??
                resolveMedia(product?.images?.[0]);
              const price = variant?.priceInUSD ?? product?.priceInUSD ?? 0;

              return (
                <div
                  key={item.id ?? idx}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-background/50"
                >
                  {image ? (
                    <div className="relative size-11 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={image.url}
                        alt={image.alt || name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-11 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {name}
                    </p>
                    {variantLabel && (
                      <p className="text-xs text-muted-foreground truncate">
                        {variantLabel}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {translations.qty} {formatNumber(item.quantity, locale)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-foreground shrink-0">
                    {formatCurrency(price * item.quantity, locale)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Order Meta */}
        <div className="grid gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {translations.orderId}
            </span>
            <span className="ml-auto font-mono font-medium text-foreground">
              {formatNumber(Number(order.id), locale)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{translations.date}</span>
            <span className="ml-auto text-foreground">
              {formatDate(order.createdAt, locale)}
            </span>
          </div>
          {order.currency && (
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {translations.currency}
              </span>
              <span className="ml-auto text-foreground">{order.currency}</span>
            </div>
          )}
        </div>

        {/* Shipping Address */}
        {order.shippingAddress?.addressLine1 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                {translations.shippingAddressTitle}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {[
                  order.shippingAddress.firstName,
                  order.shippingAddress.lastName,
                ]
                  .filter(Boolean)
                  .join(" ")}
                <br />
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && (
                  <>
                    <br />
                    {order.shippingAddress.addressLine2}
                  </>
                )}
                <br />
                {[
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
                {order.shippingAddress.country && (
                  <>
                    <br />
                    {order.shippingAddress.country}
                  </>
                )}
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function OrdersCard({
  translations,
  locale,
}: {
  translations: typeof accountEn;
  locale: SupportedLocale;
}) {
  const [orders, setOrders] = useState<OrderWithProducts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProducts | null>(
    null,
  );

  const fetchOrders = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    try {
      const { data, response } = await api.GET("/api/orders", {
        params: { query: { page: pageNum, limit: 10 } },
      });
      if (!response.ok) throw new Error("Failed to fetch");
      setOrders((data?.orders as OrderWithProducts[]) ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalDocs(data?.totalDocs ?? 0);
      setPage(pageNum);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders]);

  const ordersPlacedText =
    totalDocs === 0
      ? translations.ordersPastPurchases
      : totalDocs === 1
        ? translations.ordersPlacedOne
        : totalDocs === 2 && locale === "ar"
          ? translations.ordersPlacedTwo
          : translations.ordersPlaced
              .replace("{count}", formatNumber(totalDocs, locale))
              .replace("{s}", totalDocs !== 1 ? "s" : "");

  return (
    <>
      <Card className="rounded-xl border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10">
                <Package className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="font-serif text-lg">
                  {translations.ordersTitle}
                </CardTitle>
                <CardDescription className="text-sm">
                  {ordersPlacedText}
                </CardDescription>
              </div>
            </div>
            {orders.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-xl gap-1.5 shrink-0"
              >
                <Link href="/products">
                  <ShoppingBag className="size-3.5" />
                  {translations.shop}
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center size-16 rounded-2xl bg-muted/60 mb-4">
                <Package className="size-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {translations.noOrdersTitle}
              </p>
              <p className="text-xs text-muted-foreground mb-6 max-w-xs">
                {translations.noOrdersDescriptionLong}
              </p>
              <Button asChild className="rounded-xl gap-2">
                <Link href="/products">
                  <ShoppingBag className="size-4" />
                  {translations.browseProducts}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onClick={() => setSelectedOrder(order)}
                  translations={translations}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border/50 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {translations.pageOfTotal
                .replace("{page}", formatNumber(page, locale))
                .replace("{total}", formatNumber(totalPages, locale))}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => fetchOrders(page - 1)}
                className="rounded-xl gap-1 h-8"
              >
                <ChevronLeft className="size-3.5" />
                {translations.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => fetchOrders(page + 1)}
                className="rounded-xl gap-1 h-8"
              >
                {translations.next}
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <OrderDetailDialog
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
        translations={translations}
        locale={locale}
      />
    </>
  );
}
