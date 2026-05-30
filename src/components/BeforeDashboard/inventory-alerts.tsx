"use client";

import { useState } from "react";
import { useSaaSignalChannel } from "@/hooks/use-saasignal-channel";

interface StockAlert {
  productId: number;
  productName: string;
  remaining: number;
  timestamp: number;
}

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  useSaaSignalChannel({
    channel: "inventory",
    onEvent: (event) => {
      if (event.event === "stock:low") {
        setAlerts((prev) => [
          {
            productId: event.data.productId as number,
            productName: (event.data.productName as string) ?? "Unknown",
            remaining: event.data.remaining as number,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 19), // Keep latest 20
        ]);
      }
    },
  });

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
      <h3 className="mb-2 text-sm font-semibold text-orange-800 dark:text-orange-200">
        Low Stock Alerts
      </h3>
      <ul className="space-y-1">
        {alerts.map((alert) => (
          <li
            key={`${alert.productId}-${alert.timestamp}`}
            className="text-xs text-orange-700 dark:text-orange-300"
          >
            <span className="font-medium">{alert.productName}</span> — only{" "}
            {alert.remaining} left in stock
          </li>
        ))}
      </ul>
    </div>
  );
}
