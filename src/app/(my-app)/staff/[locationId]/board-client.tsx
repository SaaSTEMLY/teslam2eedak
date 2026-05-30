"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  statusLabel,
  type KitchenStatus,
} from "@/lib/ordering/tracker";
import { nextAllowed } from "@/lib/ordering/status-transitions";

interface Ticket {
  orderId: string | number;
  kitchenStatus: KitchenStatus;
  fulfillmentMode: string;
  createdAt: string;
  updatedAt: string;
  amountQirsh: number;
  tableLabel: string | null;
  pickupTime: string | null;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: string;
  items: ReadonlyArray<{ title: string; quantity: number }>;
}

const POLL_MS = 4_000;

function formatLE(q: number): string {
  return `${(q / 100).toFixed(2)} LE`;
}

function minutesSince(iso: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60_000));
}

function ageLabel(iso: string, now: Date): string {
  const m = minutesSince(iso, now);
  if (m < 1) return "now";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h${m % 60 ? ` ${m % 60}m` : ""}`;
}

interface BoardClientProps {
  locationId: string;
  locationName: string;
}

export function BoardClient({ locationId, locationName }: BoardClientProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date(0));
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/staff/orders?location=${encodeURIComponent(locationId)}`,
        { cache: "no-store" },
      );
      if (res.status === 401 || res.status === 403) {
        setError("You don't have access to this board.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(`Failed to load (${res.status})`);
        setLoading(false);
        return;
      }
      const body = (await res.json()) as { tickets: Ticket[] };
      setTickets(body.tickets);
      setError(null);
      setLoading(false);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    void load();
    setNow(new Date());
    const timer = setInterval(() => {
      void load();
      setNow(new Date());
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const columns = useMemo(() => {
    const buckets: Record<KitchenStatus, Ticket[]> = {
      placed: [],
      preparing: [],
      ready: [],
      delivered: [],
      cancelled: [],
    };
    for (const t of tickets) buckets[t.kitchenStatus].push(t);
    return (["placed", "preparing", "ready"] as const).map((s) => ({
      status: s,
      label: statusLabel(s),
      items: buckets[s],
    }));
  }, [tickets]);

  const advance = async (t: Ticket, to: KitchenStatus) => {
    if (busyId !== null) return;
    setBusyId(t.orderId);
    try {
      const res = await fetch(`/api/orders/${t.orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "Failed to update");
      } else {
        // Optimistic; load will reconcile on next tick.
        setTickets((prev) =>
          prev
            .map((x) =>
              x.orderId === t.orderId ? { ...x, kitchenStatus: to } : x,
            )
            .filter((x) =>
              x.kitchenStatus !== "delivered" && x.kitchenStatus !== "cancelled"
                ? true
                : false,
            ),
        );
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusyId(null);
    }
  };

  const markPaid = async (t: Ticket) => {
    if (busyId !== null) return;
    setBusyId(t.orderId);
    try {
      const res = await fetch(
        `/api/orders/${t.orderId}/payment-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: "paid" }),
        },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "Failed to mark paid");
      } else {
        setTickets((prev) =>
          prev.map((x) =>
            x.orderId === t.orderId ? { ...x, paymentStatus: "paid" } : x,
          ),
        );
      }
    } catch {
      setError("Network error.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="min-h-[80vh] py-6 px-3" id="main-content">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between gap-3 mb-4 px-1">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Live Orders Board
            </p>
            <h1 className="font-serif text-2xl font-bold">{locationName}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCcw className="size-4" />
            <span>auto-refreshes every {POLL_MS / 1000}s</span>
          </div>
        </header>

        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2 text-sm mb-3">
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {columns.map((col) => (
              <section
                key={col.status}
                className="rounded-2xl border border-border bg-card/50 p-3 min-h-[40vh]"
              >
                <header className="flex items-baseline justify-between mb-3 px-1">
                  <h2 className="text-sm font-bold uppercase tracking-wide">
                    {col.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {col.items.length}
                  </span>
                </header>
                <ul className="space-y-2">
                  {col.items.map((t) => {
                    const allowed = nextAllowed(t.kitchenStatus);
                    return (
                      <li
                        key={String(t.orderId)}
                        className={cn(
                          "rounded-xl border border-border bg-background p-3 shadow-sm",
                          busyId === t.orderId && "opacity-60",
                        )}
                      >
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <span className="font-bold">
                            #{String(t.orderId).slice(-4)}
                          </span>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {ageLabel(t.createdAt, now)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <p className="text-xs text-muted-foreground">
                            {t.tableLabel
                              ? `Table ${t.tableLabel}`
                              : t.fulfillmentMode === "pickup"
                                ? "PICKUP"
                                : t.fulfillmentMode.toUpperCase()}
                          </p>
                          {t.paymentMethod === "cash-on-pickup" &&
                          t.paymentStatus === "pending" ? (
                            <span className="inline-flex items-center rounded-full bg-accent/15 text-accent-foreground border border-accent/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                              Cash pending
                            </span>
                          ) : null}
                          {t.paymentStatus === "paid" ? (
                            <span className="inline-flex items-center rounded-full bg-primary/15 text-primary border border-primary/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                              Paid
                            </span>
                          ) : null}
                        </div>
                        <ul className="text-sm space-y-0.5 mb-2">
                          {t.items.map((it, idx) => (
                            <li
                              key={`${it.title}-${idx}`}
                              className="truncate"
                            >
                              {it.quantity > 1 ? `${it.quantity}× ` : ""}
                              {it.title || "(item)"}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 flex-wrap">
                          <span className="text-xs font-semibold tabular-nums">
                            {formatLE(t.amountQirsh)}
                          </span>
                          <div className="flex gap-1.5 flex-wrap">
                            {t.paymentMethod === "cash-on-pickup" &&
                            t.paymentStatus === "pending" ? (
                              <button
                                type="button"
                                disabled={busyId !== null}
                                onClick={() => markPaid(t)}
                                className="rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                              >
                                Mark paid
                              </button>
                            ) : null}
                            {allowed
                              .filter((s) => s !== "cancelled")
                              .map((to) => (
                                <button
                                  key={to}
                                  type="button"
                                  disabled={busyId !== null}
                                  onClick={() => advance(t, to)}
                                  className="rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                >
                                  → {statusLabel(to)}
                                </button>
                              ))}
                            {allowed.includes("cancelled") ? (
                              <button
                                type="button"
                                aria-label="Cancel"
                                disabled={busyId !== null}
                                onClick={() => advance(t, "cancelled")}
                                className="rounded-full border border-destructive/40 text-destructive p-1 hover:bg-destructive/10 disabled:opacity-50"
                              >
                                <X className="size-3.5" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                  {col.items.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic px-2 py-6 text-center">
                      Nothing here yet.
                    </p>
                  ) : null}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
