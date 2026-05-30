"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  KITCHEN_STATUSES,
  statusLabel,
  statusProgressFraction,
  isTerminalStatus,
  type KitchenStatus,
} from "@/lib/ordering/tracker";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";

interface TrackerPayload {
  orderId: string | number;
  status: KitchenStatus;
  fulfillmentMode: FulfillmentMode;
  currency: string;
  amountQirsh: number;
  placedAt: string;
  items: ReadonlyArray<{ title: string; quantity: number; amount: number }>;
  location: { label: string } | null;
  table: { label: string } | null;
  pickupTime: string | null;
}

function formatLE(q: number): string {
  return `${(q / 100).toFixed(2)} LE`;
}

const POLL_INTERVAL_MS = 5_000;

export function TrackerClient({ orderId }: { orderId: string | number }) {
  const [data, setData] = useState<TrackerPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/track`, {
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) setError(`Order not found (${res.status})`);
          return;
        }
        const json = (await res.json()) as TrackerPayload;
        if (cancelled) return;
        setData(json);
        setError(null);
        if (!isTerminalStatus(json.status)) {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError("Connection error — retrying...");
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId]);

  if (error && !data) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <AlertTriangle className="size-8 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">{error}</h1>
          <p className="text-muted-foreground">
            Check the URL or scan the table QR again.
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  const progress = statusProgressFraction({ status: data.status });

  return (
    <main className="min-h-[80vh] pb-20 pt-10 px-4" id="main-content">
      <div className="mx-auto max-w-md space-y-8">
        <header className="text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Order #{data.orderId}
          </p>
          <h1 className="font-serif text-3xl font-bold">
            {statusLabel(data.status)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {data.fulfillmentMode === "dine-in" && data.table
              ? `Table ${data.table.label}`
              : data.fulfillmentMode === "pickup"
                ? `Pickup${data.location ? ` · ${data.location.label}` : ""}`
                : null}
          </p>
        </header>

        <section className="relative h-2 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 transition-all duration-500",
              data.status === "cancelled" ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </section>

        <ol className="space-y-3">
          {KITCHEN_STATUSES.filter((s) => s !== "cancelled").map((s) => {
            const reached =
              KITCHEN_STATUSES.indexOf(s) <=
              KITCHEN_STATUSES.indexOf(data.status);
            const current = s === data.status;
            return (
              <li
                key={s}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition",
                  reached
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/40",
                  current && "shadow-md",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center size-7 rounded-full text-xs font-bold",
                    reached
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {reached ? <Check className="size-4" /> : null}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    !reached && "text-muted-foreground",
                  )}
                >
                  {statusLabel(s)}
                </span>
              </li>
            );
          })}
        </ol>

        <section className="space-y-2 border-t border-border/40 pt-6">
          <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Items
          </h2>
          {data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              (Detail unavailable.)
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.items.map((it, i) => (
                <li
                  key={`${it.title}-${i}`}
                  className="flex items-baseline justify-between gap-3 py-2 text-sm"
                >
                  <span>
                    {it.quantity > 1 ? `${it.quantity} × ` : ""}
                    {it.title}
                  </span>
                  <span className="tabular-nums">{formatLE(it.amount)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-baseline justify-between pt-2 border-t border-border/40">
            <span className="font-semibold">Total</span>
            <span className="font-bold tabular-nums">
              {formatLE(data.amountQirsh)}
            </span>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">
          Bookmark this page — it&rsquo;s your receipt too.
        </p>
      </div>
    </main>
  );
}
