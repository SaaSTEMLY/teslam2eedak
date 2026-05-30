"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { useCartDrawer } from "@/contexts/cart-drawer-context";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface AddToCartButtonProps {
  product: {
    id: string | number;
  };
  quantity?: number;
  className?: string;
  variant?: "default" | "outline";
  showIcon?: boolean;
  translations?: {
    addToCart: string;
    added: string;
  };
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  variant = "default",
  showIcon = true,
  translations,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { openCart } = useCartDrawer();
  const [isAdded, setIsAdded] = useState(false);

  const t = translations || { addToCart: "Add to Cart", added: "Added!" };

  const handleAddToCart = async () => {
    await addItem({ product: Number(product.id) }, quantity);
    openCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Fire add_to_cart signal for recommendations
    api
      .POST("/api/recommendations/signal", {
        body: { productId: String(product.id), signal: "add_to_cart" },
      })
      .catch(() => {});
  };

  return (
    <Button
      onClick={handleAddToCart}
      variant={variant}
      className={cn(
        "gap-2 transition-all",
        isAdded && "bg-green-600 hover:bg-green-600",
        className,
      )}
      disabled={isAdded}
    >
      {showIcon &&
        (isAdded ? (
          <Check className="size-4" />
        ) : (
          <ShoppingBag className="size-4" />
        ))}
      {isAdded ? t.added : t.addToCart}
    </Button>
  );
}
