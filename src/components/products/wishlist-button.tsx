"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface WishlistButtonProps {
  productId: string | number;
  translations: {
    addedToWishlist: string;
    removedFromWishlist: string;
    saveForLater: string;
    removeFromWishlist: string;
    loginToSave: string;
  };
  isAuthenticated: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistButton({
  productId,
  translations: t,
  isAuthenticated,
  size = "md",
  className,
}: WishlistButtonProps) {
  const [inWishlist, setInWishlist] = useState(false);
  const [itemId, setItemId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    api
      .GET("/api/wishlist/check/{productId}", {
        params: { path: { productId: String(productId) } },
      })
      .then(({ data }) => {
        if (data) {
          setInWishlist(data.inWishlist ?? false);
          setItemId(data.itemId ?? null);
        }
      })
      .catch(() => {});
  }, [productId, isAuthenticated]);

  const toggle = async () => {
    if (!isAuthenticated) {
      toast.info(t.loginToSave);
      return;
    }

    setLoading(true);

    try {
      if (inWishlist && itemId) {
        await api.DELETE("/api/wishlist/{itemId}", {
          params: { path: { itemId: String(itemId) } },
        });
        setInWishlist(false);
        setItemId(null);
        toast.success(t.removedFromWishlist);
      } else {
        const { data } = await api.POST("/api/wishlist", {
          body: { productId: Number(productId) },
        });
        setInWishlist(true);
        setItemId((data?.item as { id?: number } | undefined)?.id ?? null);
        toast.success(t.addedToWishlist);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={inWishlist ? t.removeFromWishlist : t.saveForLater}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all",
        size === "sm" ? "size-8" : "size-10",
        inWishlist
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-500",
        "hover:bg-accent",
        className,
      )}
    >
      <Heart
        className={cn(
          size === "sm" ? "size-4" : "size-5",
          inWishlist && "fill-current",
        )}
      />
    </button>
  );
}
