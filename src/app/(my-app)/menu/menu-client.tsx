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
import { ItemSheet, type ItemSheetItem, type ItemAddPayload } from "./item-sheet";
import { CartProvider, useCart } from "./cart-context";
import { CartDrawer } from "./cart-drawer";

export interface MenuItemForClient {
  id: string | number;
  name: string;
  description: string;
  section: string;
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
    items: ReadonlyArray<MenuItemForClient>;
  }>;
}

export function MenuClient(props: MenuClientProps) {
  const scope =
    props.fulfillmentMode === "dine-in" && props.table
      ? `dine-in:${props.table.shortId}`
      : props.location
        ? `${props.fulfillmentMode}:${props.location.slug}`
        : `${props.fulfillmentMode}:global`;
  return (
    <CartProvider scope={scope}>
      <MenuBody {...props} />
    </CartProvider>
  );
}

function MenuBody(props: MenuClientProps) {
  const cart = useCart();
  const [activePreferences, setActivePreferences] = useState<
    ReadonlyArray<DietaryPreference>
  >([]);
  const [selectedItemId, setSelectedItemId] = useState<
    string | number | null
  >(null);

  const itemsById = useMemo(() => {
    const map = new Map<string | number, MenuItemForClient>();
    for (const s of props.sections) {
      for (const it of s.items) {
        map.set(it.id, it);
      }
    }
    return map;
  }, [props.sections]);

  const filteredSections = useMemo(() => {
    return props.sections.map((section) => ({
      title: section.title,
      items: applyAllergenFilter(
        section.items.map((it) => ({
          ...it,
          allergens: it.allergens as ReadonlyArray<AllergenTag>,
        })),
        activePreferences,
      ).map(({ item, dimmed }) => ({
        item: {
          id: item.id,
          name: item.name,
          description: item.description,
          section: item.section,
          basePriceQirsh: item.basePriceQirsh,
          allergens: item.allergens,
          sizes: item.sizes,
          available: item.available,
        },
        dimmed,
      })),
    }));
  }, [props.sections, activePreferences]);

  const selectedItem: ItemSheetItem | null = selectedItemId
    ? (itemsById.get(selectedItemId) ?? null)
    : null;

  const handleAdd = (payload: ItemAddPayload) => {
    cart.add(payload);
  };

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

      <MenuListView
        sections={filteredSections}
        onItemSelect={(id) => setSelectedItemId(id)}
      />

      <ItemSheet
        item={selectedItem}
        open={selectedItemId !== null}
        onClose={() => setSelectedItemId(null)}
        onAdd={handleAdd}
      />

      <CartDrawer
        fulfillmentMode={props.fulfillmentMode}
        vatPercent={props.location?.vatPercent ?? 14}
        serviceChargePercent={props.location?.serviceChargePercent ?? 12}
        context={{
          locationId: props.location?.id ?? null,
          tableId: props.table?.id ?? null,
          tableShortId: props.table?.shortId ?? null,
          locationSlug: props.location?.slug ?? null,
        }}
      />
    </main>
  );
}
