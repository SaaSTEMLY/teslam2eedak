"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, ListOrdered } from "lucide-react";

import { cn } from "@/lib/utils";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";
import {
  applyAllergenFilter,
  type AllergenTag,
  type DietaryPreference,
} from "@/lib/ordering/menu-filter";
import { mapHotspotsToSections } from "@/lib/ordering/menu-image-mapping";

import { AllergenFilter } from "./allergen-filter";
import { MenuListView } from "./menu-list-view";
import { MenuImageView } from "./menu-image-view";
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
  hotspots: ReadonlyArray<{
    locale: string;
    menuImageId: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}

interface MenuClientProps {
  fulfillmentMode: FulfillmentMode;
  locale: "en" | "ar" | "es";
  menuImages: ReadonlyArray<{ id: string; url: string; label: string }>;
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

type ViewMode = "list" | "image";

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

  const allItems = useMemo(
    () => props.sections.flatMap((s) => s.items),
    [props.sections],
  );

  const hasAnyHotspots = useMemo(
    () => allItems.some((it) => it.hotspots.length > 0),
    [allItems],
  );

  const [viewMode, setViewMode] = useState<ViewMode>(
    hasAnyHotspots ? "image" : "list",
  );

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

  const dimmedByItemId = useMemo(() => {
    const out = new Map<string | number, boolean>();
    for (const s of filteredSections) {
      for (const row of s.items) {
        out.set(row.item.id, row.dimmed);
      }
    }
    return out;
  }, [filteredSections]);

  const imageSections = useMemo(() => {
    const mapped = mapHotspotsToSections({
      images: props.menuImages,
      items: allItems.map((it) => ({
        id: it.id,
        name: it.name,
        available: it.available,
        hotspots: it.hotspots,
      })),
      locale: props.locale,
    });
    return mapped.map((s) => ({
      image: s.image,
      hotspots: s.hotspots.map((h) => ({
        item: { id: h.item.id, name: h.item.name, available: h.item.available },
        box: h.box,
        dimmed: dimmedByItemId.get(h.item.id) ?? false,
      })),
    }));
  }, [props.menuImages, allItems, props.locale, dimmedByItemId]);

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
        <div className="mx-auto max-w-3xl px-4 pb-3 flex items-center gap-2">
          <AllergenFilter
            value={activePreferences}
            onChange={setActivePreferences}
          />
          {hasAnyHotspots ? (
            <div className="ms-auto inline-flex items-center rounded-full border border-border bg-card p-0.5">
              <button
                type="button"
                aria-pressed={viewMode === "image"}
                onClick={() => setViewMode("image")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition",
                  viewMode === "image"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
                aria-label="Menu image view"
              >
                <ImageIcon className="size-3.5" />
                <span className="sr-only sm:not-sr-only">Image</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
                aria-label="List view"
              >
                <ListOrdered className="size-3.5" />
                <span className="sr-only sm:not-sr-only">List</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {viewMode === "image" && hasAnyHotspots ? (
        <MenuImageView
          sections={imageSections}
          onItemSelect={(id) => setSelectedItemId(id)}
        />
      ) : (
        <MenuListView
          sections={filteredSections}
          onItemSelect={(id) => setSelectedItemId(id)}
        />
      )}

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
