"use client";

import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";
import {
  applyAllergenFilter,
  type AllergenTag,
  type DietaryPreference,
} from "@/lib/ordering/menu-filter";

import { AllergenFilter } from "./allergen-filter";
import { MenuListView } from "./menu-list-view";

interface MenuClientProps {
  fulfillmentMode: FulfillmentMode;
  table: { id: string | number; label: string; shortId: string } | null;
  location: {
    id: string | number;
    name: string;
    slug: string;
    vatPercent: number;
    serviceChargePercent: number;
  } | null;
  sections: ReadonlyArray<{
    title: string;
    items: ReadonlyArray<{
      id: string | number;
      name: string;
      description: string;
      section: string;
      basePriceQirsh: number;
      allergens: ReadonlyArray<string>;
      sizes: ReadonlyArray<{ label: string; value: string; priceQirsh: number }>;
      available: boolean;
    }>;
  }>;
}

export function MenuClient(props: MenuClientProps) {
  const [activePreferences, setActivePreferences] = useState<
    ReadonlyArray<DietaryPreference>
  >([]);

  const filteredSections = useMemo(() => {
    return props.sections.map((section) => ({
      title: section.title,
      items: applyAllergenFilter(
        section.items.map((it) => ({
          ...it,
          allergens: it.allergens as ReadonlyArray<AllergenTag>,
        })),
        activePreferences,
      ),
    }));
  }, [props.sections, activePreferences]);

  const headerLabel =
    props.fulfillmentMode === "dine-in" && props.table
      ? `Table ${props.table.label}`
      : props.fulfillmentMode === "pickup"
        ? "Pickup"
        : "Menu";

  const locationLabel = props.location?.name ?? "";

  return (
    <main className="min-h-[80vh] pb-32" id="main-content">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {headerLabel}
            </p>
            <h1 className="font-serif text-xl sm:text-2xl font-bold truncate">
              Koffee Kulture
              {locationLabel ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {locationLabel}
                </span>
              ) : null}
            </h1>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium",
              "bg-card text-foreground/80",
            )}
          >
            {props.fulfillmentMode === "dine-in"
              ? "Dine-in"
              : props.fulfillmentMode === "pickup"
                ? "Click & Collect"
                : props.fulfillmentMode}
          </span>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <AllergenFilter
            value={activePreferences}
            onChange={setActivePreferences}
          />
        </div>
      </header>

      <MenuListView sections={filteredSections} />
    </main>
  );
}
