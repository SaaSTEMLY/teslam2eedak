"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { computeCartTotals } from "@/lib/ordering/totals";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";

import { useCart } from "./cart-context";

function formatLE(q: number): string {
  return `${(q / 100).toFixed(2)} LE`;
}

interface CartDrawerProps {
  fulfillmentMode: FulfillmentMode;
  vatPercent: number;
  serviceChargePercent: number;
  context: {
    locationId: string | number | null;
    tableId: string | number | null;
    locationSlug: string | null;
    tableShortId: string | null;
  };
}

export function CartDrawer({
  fulfillmentMode,
  vatPercent,
  serviceChargePercent,
  context,
}: CartDrawerProps) {
  const cart = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(
    () =>
      computeCartTotals({
        lineItems: cart.state.lines.map((l) => ({ amount: l.amountQirsh })),
        fulfillmentMode,
        vatPercent,
        serviceChargePercent,
        tipAmount,
      }),
    [cart.state.lines, fulfillmentMode, vatPercent, serviceChargePercent, tipAmount],
  );

  const empty = cart.state.lines.length === 0;

  const handlePlaceOrder = async () => {
    if (empty || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfillmentMode,
          locationId: context.locationId,
          tableId: context.tableId,
          tableShortId: context.tableShortId,
          locationSlug: context.locationSlug,
          tipAmount,
          paymentProvider:
            fulfillmentMode === "dine-in" ? "stripe" : "cash-on-pickup",
          lines: cart.state.lines.map((l) => ({
            itemId: l.itemId,
            sizeValue: l.sizeValue,
            modifierSelections: l.modifierSelections,
            quantity: l.quantity,
            note: l.note,
            amountQirsh: l.amountQirsh,
          })),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "Failed to place order");
        return;
      }
      const body = (await res.json()) as { trackerUrl: string };
      cart.clear();
      router.push(body.trackerUrl);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open cart"
          className={cn(
            "fixed bottom-5 left-1/2 -translate-x-1/2 z-40",
            "inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground",
            "px-5 py-3 shadow-lg shadow-foreground/10 hover:opacity-90 transition",
            empty && "opacity-0 pointer-events-none",
          )}
        >
          <ShoppingBag className="size-4" />
          <span className="font-semibold">
            {cart.totalQty} item{cart.totalQty === 1 ? "" : "s"}
          </span>
          <span className="font-bold">· {formatLE(totals.grandTotal)}</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto flex flex-col gap-4 pb-8 sm:max-w-2xl sm:mx-auto sm:rounded-t-3xl"
      >
        <SheetHeader className="text-start">
          <SheetTitle className="font-serif text-2xl">Your Order</SheetTitle>
        </SheetHeader>

        {empty ? (
          <p className="py-8 text-center text-muted-foreground">
            Your cart is empty. Tap an item to add it.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {cart.state.lines.map((line) => (
              <li key={line.id} className="py-3 flex gap-3 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold">Item #{line.itemId}</span>
                    {line.sizeValue ? (
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        {line.sizeValue}
                      </span>
                    ) : null}
                  </div>
                  {line.modifierSelections.length > 0 ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {line.modifierSelections
                        .map((m) => m.optionValues.join(", "))
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {line.note ? (
                    <p className="text-xs italic text-muted-foreground mt-0.5">
                      “{line.note}”
                    </p>
                  ) : null}
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-border px-2 py-1">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() =>
                        cart.setQuantity(line.id, line.quantity - 1)
                      }
                      className="inline-flex items-center justify-center size-6 rounded-full hover:bg-secondary/60"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() =>
                        cart.setQuantity(line.id, line.quantity + 1)
                      }
                      className="inline-flex items-center justify-center size-6 rounded-full hover:bg-secondary/60"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <span className="font-bold tabular-nums">
                    {formatLE(line.amountQirsh)}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => cart.remove(line.id)}
                    className="text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!empty ? (
          <>
            <section className="space-y-2 border-t border-border/40 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatLE(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  VAT ({vatPercent}%)
                </span>
                <span className="tabular-nums">{formatLE(totals.vatAmount)}</span>
              </div>
              {fulfillmentMode === "dine-in" ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Service ({serviceChargePercent}%)
                  </span>
                  <span className="tabular-nums">
                    {formatLE(totals.serviceChargeAmount)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm items-baseline">
                <span className="text-muted-foreground">Tip</span>
                <div className="flex items-center gap-1">
                  {[0, 500, 1000, 1500].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      aria-pressed={tipAmount === tip}
                      onClick={() => setTipAmount(tip)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px]",
                        tipAmount === tip
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border",
                      )}
                    >
                      {tip === 0 ? "—" : `${tip / 100} LE`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-border/40">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg tabular-nums">
                  {formatLE(totals.grandTotal)}
                </span>
              </div>
            </section>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <Button
              type="button"
              size="lg"
              disabled={empty || submitting}
              onClick={handlePlaceOrder}
              className="rounded-full"
            >
              {submitting
                ? "Placing order…"
                : fulfillmentMode === "dine-in"
                  ? `Send to kitchen · ${formatLE(totals.grandTotal)}`
                  : `Place order · ${formatLE(totals.grandTotal)}`}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground">
              {fulfillmentMode === "dine-in"
                ? "Pay at the table before your order goes to the kitchen."
                : "Pay card on the next screen, or cash when you collect."}
            </p>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
