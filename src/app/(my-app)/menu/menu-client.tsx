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

  // Single-line context label — no duplicate of the brand (that's in
  // the global site header already). At 320px this collapses to just
  // the mode pill; allergen filter is horizontally scrollable.
  const modeLabel =
    props.fulfillmentMode === "dine-in" && props.table
      ? `Table ${props.table.label}`
      : props.fulfillmentMode === "pickup"
        ? "Pickup"
        : "Menu";
  const branchLabel = props.location?.name ?? "";

  return (
    <main
      className="min-h-[80vh] pb-32 pt-20 sm:pt-24"
      id="main-content"
      aria-label="Menu"
    >
      <header
        className="sticky top-16 sm:top-20 z-30 bg-background/90 backdrop-blur-xl border-b border-border/60"
        aria-label="Order context"
      >
        <div className="mx-auto max-w-3xl px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
          {/* Mode pill — minimum tap surface; always visible. */}
          <span
            className={cn(
              "shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/12 text-primary border border-primary/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
            )}
            aria-label={`Ordering mode: ${modeLabel}`}
          >
            {modeLabel}
          </span>

          {/* Branch name — secondary; hide on viewports < 400px.
              Logo + brand are in the global header already; we only
              surface the branch here when there's a meaningful one. */}
          {branchLabel ? (
            <span
              className="hidden min-[400px]:inline shrink-0 text-xs text-muted-foreground truncate max-w-[40vw]"
              aria-label="Branch"
            >
              {branchLabel}
            </span>
          ) : null}

          {/* Allergen filter — horizontally scrollable on narrow widths
              (already overflow-x-auto inside). Takes remaining space. */}
          <div className="flex-1 min-w-0 overflow-x-auto -mx-1 px-1">
            <AllergenFilter
              value={activePreferences}
              onChange={setActivePreferences}
            />
          </div>

          {/* View toggle — only when hotspots exist. Icon-only at all
              widths to keep the row a single line. */}
          {hasAnyHotspots ? (
            <div
              className="shrink-0 inline-flex items-center rounded-full border border-border bg-card p-0.5"
              role="group"
              aria-label="Menu view"
            >
              <button
                type="button"
                aria-pressed={viewMode === "image"}
                onClick={() => setViewMode("image")}
                className={cn(
                  "inline-flex items-center justify-center size-7 rounded-full transition",
                  viewMode === "image"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="Menu image view"
              >
                <ImageIcon className="size-3.5" aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center justify-center size-7 rounded-full transition",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label="List view"
              >
                <ListOrdered className="size-3.5" aria-hidden />
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
