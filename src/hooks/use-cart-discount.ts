"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@payloadcms/plugin-ecommerce/client/react";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

export interface DiscountInfo {
  discountId: number;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscountAmount: number | null;
  discountAmount: number;
}

interface CartDiscountMessages {
  invalid: string;
  validating: string;
}

interface ApplyDiscountResponse {
  success: boolean;
  discount?: DiscountInfo;
  error?: string;
}

interface ValidateDiscountResponse {
  valid: boolean;
  discountId?: number;
  code?: string;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  maxDiscountAmount?: number | null;
  discountAmount?: number;
  error?: string;
}

const defaultMessages: CartDiscountMessages = {
  invalid: "Invalid discount code",
  validating: "Failed to validate code. Please try again.",
};

const DISCOUNT_STORAGE_KEY = "cart_discount";
const DISCOUNT_EVENT = "cart-discount-updated";

const readStoredDiscount = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiscountInfo;
  } catch {
    return null;
  }
};

const writeStoredDiscount = (discount: DiscountInfo | null) => {
  if (typeof window === "undefined") return;
  try {
    if (discount) {
      localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discount));
    } else {
      localStorage.removeItem(DISCOUNT_STORAGE_KEY);
    }
    window.dispatchEvent(
      new CustomEvent(DISCOUNT_EVENT, { detail: { discount } }),
    );
  } catch {
    // Ignore storage failures
  }
};

const getStoredCartSecret = () => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("cart_secret");
  } catch {
    return null;
  }
};

export function useCartDiscount(
  messages: CartDiscountMessages = defaultMessages,
) {
  const { cart, refreshCart } = useCart();
  const [discount, setDiscount] = useState<DiscountInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastCheckedRef = useRef<{ code: string; subtotal: number } | null>(
    null,
  );

  const cartId = cart?.id;
  const subtotal = cart?.subtotal ?? 0;
  const cartDiscountCode = cart?.discountCode ?? null;

  const applyDiscountCode = useCallback(
    async (code: string) => {
      if (!cartId) {
        setError(messages.validating);
        return null;
      }

      const normalized = code.toUpperCase().trim();
      if (!normalized) return null;

      setIsValidating(true);
      setError(null);

      try {
        const { data, response } = await api.POST("/api/cart/apply-discount", {
          body: {
            code: normalized,
            cartId,
            secret: getStoredCartSecret() ?? undefined,
          },
        });

        const typedData = data as ApplyDiscountResponse | undefined;

        if (!response.ok || !typedData?.success || !typedData.discount) {
          setError(typedData?.error || messages.invalid);
          return null;
        }

        setDiscount(typedData.discount);
        lastCheckedRef.current = { code: typedData.discount.code, subtotal };
        setError(null);
        writeStoredDiscount(typedData.discount);
        try {
          await refreshCart?.();
        } catch {
          // Ignore refresh failures to avoid false validation errors
        }
        return typedData.discount;
      } catch {
        setError(messages.validating);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [cartId, messages.invalid, messages.validating, refreshCart, subtotal],
  );

  const removeDiscount = useCallback(async () => {
    if (!cartId) return;

    setIsValidating(true);
    setError(null);

    try {
      const { error: errBody, response } = await api.POST(
        "/api/cart/remove-discount",
        {
          body: { cartId, secret: getStoredCartSecret() ?? undefined },
        },
      );

      if (!response.ok) {
        const typedErr = errBody as { error?: string } | undefined;
        setError(typedErr?.error || messages.validating);
        return;
      }

      setDiscount(null);
      lastCheckedRef.current = null;
      writeStoredDiscount(null);
      try {
        await refreshCart?.();
      } catch {
        // Ignore refresh failures to avoid false validation errors
      }
    } catch {
      setError(messages.validating);
    } finally {
      setIsValidating(false);
    }
  }, [cartId, messages.validating, refreshCart]);

  useEffect(() => {
    const stored = readStoredDiscount();
    if (!cartDiscountCode && stored) {
      setDiscount(stored);
    }
  }, [cartDiscountCode]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== DISCOUNT_STORAGE_KEY) return;
      const stored = readStoredDiscount();
      setDiscount(stored);
    };

    const handleEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ discount: DiscountInfo | null }>)
        .detail;
      if (!detail) return;
      setDiscount(detail.discount);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(DISCOUNT_EVENT, handleEvent);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(DISCOUNT_EVENT, handleEvent);
    };
  }, []);

  useEffect(() => {
    if (!cartId || !cartDiscountCode) {
      const stored = readStoredDiscount();
      if (!cartId && stored) {
        setDiscount(stored);
        return;
      }
      if (!cartDiscountCode && stored) {
        setDiscount(stored);
        return;
      }
      setDiscount(null);
      setError(null);
      lastCheckedRef.current = null;
      writeStoredDiscount(null);
      return;
    }

    const normalized = cartDiscountCode.toUpperCase().trim();
    const lastChecked = lastCheckedRef.current;

    if (
      lastChecked &&
      lastChecked.code === normalized &&
      lastChecked.subtotal === subtotal
    ) {
      return;
    }

    let isActive = true;

    const validate = async () => {
      try {
        const { data: rawData } = await api.POST("/api/discount/validate", {
          body: { code: normalized, subtotal },
        });

        const data = rawData as ValidateDiscountResponse | undefined;

        if (!isActive) return;

        if (data?.valid) {
          const nextDiscount = {
            discountId: data.discountId ?? 0,
            code: data.code ?? normalized,
            discountType: data.discountType ?? "percentage",
            discountValue: data.discountValue ?? 0,
            maxDiscountAmount: data.maxDiscountAmount ?? null,
            discountAmount: data.discountAmount ?? 0,
          };
          setDiscount(nextDiscount);
          writeStoredDiscount(nextDiscount);
        } else {
          setDiscount(null);
          writeStoredDiscount(null);
        }

        setError(null);
        lastCheckedRef.current = { code: normalized, subtotal };
      } catch {
        if (!isActive) return;
        setDiscount(null);
        setError(null);
        writeStoredDiscount(null);
      }
    };

    validate();

    return () => {
      isActive = false;
    };
  }, [cartId, cartDiscountCode, subtotal]);

  const clearError = useCallback(() => setError(null), []);

  return {
    discount,
    isValidating,
    error,
    applyDiscountCode,
    removeDiscount,
    clearError,
  };
}
