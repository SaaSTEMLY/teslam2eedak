"use client";

import { useEffect, useRef } from "react";
import { createBrowserApiClient } from "@/lib/api/client";

const api = createBrowserApiClient();

interface SignalTrackerProps {
  productId: string | number;
  signal?: string;
}

export function SignalTracker({
  productId,
  signal = "view",
}: SignalTrackerProps) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    api
      .POST("/api/recommendations/signal", {
        body: {
          productId: String(productId),
          signal: signal as
            | "view"
            | "add_to_cart"
            | "purchase"
            | "wishlist"
            | "click",
        },
      })
      .catch(() => {});
  }, [productId, signal]);

  return null;
}
