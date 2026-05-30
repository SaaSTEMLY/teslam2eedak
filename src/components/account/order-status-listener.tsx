"use client";

import { useSaaSignalChannel } from "@/hooks/use-saasignal-channel";

interface OrderStatusListenerProps {
  userId: string;
}

const STATUS_LABELS: Record<string, string> = {
  processing: "is being processed",
  shipped: "has been shipped",
  delivered: "has been delivered",
  cancelled: "has been cancelled",
};

export function OrderStatusListener({ userId }: OrderStatusListenerProps) {
  useSaaSignalChannel({
    channel: "orders",
    onEvent: (event) => {
      if (event.event !== "order:status") return;
      if (event.data.customerId !== userId) return;

      const status = event.data.newStatus as string;
      const orderId = event.data.orderId as number;
      const label = STATUS_LABELS[status] ?? `status changed to ${status}`;

      // Use native notification or a simple toast
      if (typeof window !== "undefined") {
        const toast = document.createElement("div");
        toast.className =
          "fixed bottom-4 end-4 z-50 rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-lg text-sm animate-in fade-in slide-in-from-bottom-4";
        toast.textContent = `Your order #${orderId} ${label}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
      }
    },
    enabled: !!userId,
  });

  return null;
}
