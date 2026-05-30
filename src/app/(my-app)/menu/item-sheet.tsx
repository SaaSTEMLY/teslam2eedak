"use client";

import { useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  computeLineItemAmount,
  validateModifierSelection,
  type ModifierGroupSelection,
} from "@/lib/ordering/line-item";

export interface ItemSheetItem {
  id: string | number;
  name: string;
  description: string;
  basePriceQirsh: number;
  allergens: ReadonlyArray<string>;
  sizes: ReadonlyArray<{
    label: string;
    value: string;
    priceQirsh: number;
    isDefault?: boolean;
  }>;
  modifierGroups: ReadonlyArray<{
    slug: string;
    label: string;
    minSelectable: number;
    maxSelectable: number;
    options: ReadonlyArray<{
      value: string;
      label: string;
      priceDelta: number;
      isDefault?: boolean;
    }>;
  }>;
  available: boolean;
}

export interface ItemAddPayload {
  itemId: string | number;
  sizeValue: string | null;
  modifierSelections: ReadonlyArray<{
    groupSlug: string;
    optionValues: ReadonlyArray<string>;
  }>;
  quantity: number;
  note: string;
  amountQirsh: number;
}

interface ItemSheetProps {
  item: ItemSheetItem | null;
  open: boolean;
  onClose: () => void;
  onAdd: (payload: ItemAddPayload) => void;
}

function defaultSizeValue(sizes: ItemSheetItem["sizes"]): string | null {
  if (sizes.length === 0) return null;
  const def = sizes.find((s) => s.isDefault);
  return (def ?? sizes[0]!).value;
}

function defaultModifierValues(
  groups: ItemSheetItem["modifierGroups"],
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const g of groups) {
    const defaults = g.options.filter((o) => o.isDefault).map((o) => o.value);
    out[g.slug] = defaults.slice(0, g.maxSelectable);
  }
  return out;
}

function formatLE(q: number): string {
  return `${(q / 100).toFixed(0)} LE`;
}

/**
 * Outer container — open/close lifecycle. The body is keyed on item.id
 * so picking a different item remounts the body with fresh defaults
 * (avoids a setState-in-effect pattern).
 */
export function ItemSheet({ item, open, onClose, onAdd }: ItemSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto flex flex-col gap-6 pb-8 sm:max-w-2xl sm:mx-auto sm:rounded-t-3xl"
      >
        {item ? (
          <ItemSheetBody key={String(item.id)} item={item} onAdd={onAdd} onClose={onClose} />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

interface BodyProps {
  item: ItemSheetItem;
  onAdd: (payload: ItemAddPayload) => void;
  onClose: () => void;
}

function ItemSheetBody({ item, onAdd, onClose }: BodyProps) {
  const [sizeValue, setSizeValue] = useState<string | null>(() =>
    defaultSizeValue(item.sizes),
  );
  const [modifierState, setModifierState] = useState<Record<string, string[]>>(
    () => defaultModifierValues(item.modifierGroups),
  );
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const selections = useMemo<ReadonlyArray<ModifierGroupSelection>>(
    () =>
      item.modifierGroups.map((g) => ({
        groupSlug: g.slug,
        groupLabel: g.label,
        minSelectable: g.minSelectable,
        maxSelectable: g.maxSelectable,
        options: g.options.map((o) => ({
          value: o.value,
          label: o.label,
          priceDelta: o.priceDelta,
        })),
        selectedValues: modifierState[g.slug] ?? [],
      })),
    [item, modifierState],
  );

  const errors = useMemo(
    () => validateModifierSelection(selections),
    [selections],
  );

  const lineTotal = useMemo(
    () =>
      computeLineItemAmount({
        basePriceQirsh: item.basePriceQirsh,
        sizes: item.sizes.map((s) => ({
          label: s.label,
          value: s.value,
          priceQirsh: s.priceQirsh,
        })),
        selectedSizeValue: sizeValue,
        modifierGroups: selections,
        quantity,
      }),
    [item, sizeValue, selections, quantity],
  );

  const canAdd = item.available && errors.length === 0 && quantity >= 1;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({
      itemId: item.id,
      sizeValue,
      modifierSelections: item.modifierGroups.map((g) => ({
        groupSlug: g.slug,
        optionValues: modifierState[g.slug] ?? [],
      })),
      quantity,
      note: note.trim(),
      amountQirsh: lineTotal.amountQirsh,
    });
    onClose();
  };

  const toggleModifier = (
    g: ItemSheetItem["modifierGroups"][number],
    optionValue: string,
  ) => {
    setModifierState((prev) => {
      const current = prev[g.slug] ?? [];
      if (g.maxSelectable === 1) {
        return { ...prev, [g.slug]: [optionValue] };
      }
      if (current.includes(optionValue)) {
        return {
          ...prev,
          [g.slug]: current.filter((v) => v !== optionValue),
        };
      }
      if (current.length >= g.maxSelectable) return prev;
      return { ...prev, [g.slug]: [...current, optionValue] };
    });
  };

  return (
    <>
      <SheetHeader className="text-start">
        <SheetTitle className="font-serif text-2xl">{item.name}</SheetTitle>
        {item.description ? (
          <SheetDescription className="leading-relaxed">
            {item.description}
          </SheetDescription>
        ) : null}
        {item.allergens.length > 0 ? (
          <div className="flex gap-1.5 flex-wrap pt-1">
            {item.allergens.map((a) => (
              <span
                key={a}
                className="text-[10px] uppercase tracking-wide rounded-full bg-secondary/40 px-2 py-0.5 text-foreground/70"
              >
                {a}
              </span>
            ))}
          </div>
        ) : null}
      </SheetHeader>

      {item.sizes.length > 0 ? (
        <section className="space-y-2">
          <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Size
          </Label>
          <div className="flex flex-wrap gap-2">
            {item.sizes.map((s) => {
              const active = sizeValue === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSizeValue(s.value)}
                  className={cn(
                    "inline-flex items-baseline gap-2 rounded-full border px-4 py-1.5 text-sm transition",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-foreground/30",
                  )}
                >
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-xs opacity-80">
                    {formatLE(s.priceQirsh)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {item.modifierGroups.map((g) => {
        const selected = new Set(modifierState[g.slug] ?? []);
        const hint =
          g.minSelectable > 0
            ? `Required · pick ${g.maxSelectable === 1 ? "one" : `up to ${g.maxSelectable}`}`
            : g.maxSelectable === 1
              ? "Pick one (optional)"
              : `Pick up to ${g.maxSelectable}`;
        return (
          <section key={g.slug} className="space-y-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {g.label}
              </Label>
              <span className="text-[11px] text-muted-foreground">{hint}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.options.map((o) => {
                const active = selected.has(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleModifier(g, o.value)}
                    className={cn(
                      "inline-flex items-baseline gap-2 rounded-full border px-4 py-1.5 text-sm transition",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-foreground/30",
                    )}
                  >
                    <span>{o.label}</span>
                    {o.priceDelta !== 0 ? (
                      <span className="text-xs opacity-80">
                        {o.priceDelta > 0 ? "+" : ""}
                        {formatLE(o.priceDelta)}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="space-y-2">
        <Label
          htmlFor="item-note"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground"
        >
          Note for the kitchen
        </Label>
        <Textarea
          id="item-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="no onions, well done…"
          rows={2}
          maxLength={280}
        />
      </section>

      <section className="space-y-2">
        <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Quantity
        </Label>
        <div className="inline-flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="inline-flex items-center justify-center size-7 rounded-full bg-card hover:bg-secondary/60"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-6 text-center font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="inline-flex items-center justify-center size-7 rounded-full bg-card hover:bg-secondary/60"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </section>

      {errors.length > 0 ? (
        <p className="text-sm text-destructive">
          Please complete required selections before adding to order.
        </p>
      ) : null}

      <SheetFooter className="flex-row justify-between gap-3 items-center pt-2">
        <div className="text-xs text-muted-foreground">
          {lineTotal.sizeLabel ? `${lineTotal.sizeLabel} · ` : ""}
          {formatLE(lineTotal.unitPriceQirsh)} × {quantity}
        </div>
        <Button
          type="button"
          size="lg"
          disabled={!canAdd}
          onClick={handleAdd}
          className="rounded-full px-6"
        >
          Add · {formatLE(lineTotal.amountQirsh)}
        </Button>
      </SheetFooter>
    </>
  );
}
