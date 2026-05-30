"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { formatNumber } from "@/lib/utils";

export function CartButton({ locale }: { locale?: string }) {
  const { cart } = useCart();
  const { openCart } = useCartDrawer();

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0;

  const localizedCount = formatNumber(itemCount, locale);
  const displayCount = itemCount > 99 ? "99+" : localizedCount;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={openCart}
      aria-label={`Shopping cart with ${localizedCount} items`}
    >
      <ShoppingBag className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 size-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
          {displayCount}
        </span>
      )}
    </Button>
  );
}
