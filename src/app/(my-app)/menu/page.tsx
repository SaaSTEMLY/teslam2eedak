import type { Metadata } from "next";
import Link from "next/link";

import { getPayload } from "@/lib/payload";
import { getLocale } from "@/lib/locale";
import { generatePageMetadata } from "@/lib/seo";
import { resolveMenuContext } from "@/lib/ordering/menu-context";
import type { FulfillmentMode } from "@/lib/ordering/fulfillment";

import { MenuClient } from "./menu-client";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "Menu — Koffee Kulture",
    description:
      "Scan, sip, repeat. Order from Koffee Kulture's menu — house-roasted koffee, all-day breakfast, and the bagels Kairo whispers about.",
    path: "/menu",
  });
}

type Search = Record<string, string | string[] | undefined>;

interface MenuPageProps {
  searchParams: Promise<Search>;
}

interface ResolvedTable {
  id: string | number;
  label: string;
  shortId: string;
  locationId: string | number;
  active: boolean;
}

interface ResolvedLocation {
  id: string | number;
  name: string;
  slug: string;
  vatPercent: number;
  serviceChargePercent: number;
  allowedPaymentProviders: ReadonlyArray<string>;
}

interface MenuViewItem {
  id: string | number;
  name: string;
  description: string;
  section: string;
  basePriceQirsh: number;
  allergens: ReadonlyArray<string>;
  sizes: ReadonlyArray<{ label: string; value: string; priceQirsh: number }>;
  available: boolean;
}

const SECTION_FALLBACK = "Menu";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

async function resolveTable(
  payload: Awaited<ReturnType<typeof getPayload>>,
  shortId: string,
): Promise<ResolvedTable | null> {
  const { docs } = await payload.find({
    collection: "tables",
    where: { shortId: { equals: shortId } },
    limit: 1,
  });
  const doc = docs[0];
  if (!doc) return null;
  const obj = doc as unknown as {
    id: string | number;
    label?: string;
    shortId?: string;
    location?: string | number | { id: string | number };
    status?: string;
  };
  const location = obj.location;
  return {
    id: obj.id,
    label: obj.label ?? "",
    shortId: obj.shortId ?? shortId,
    locationId:
      typeof location === "object" && location !== null
        ? location.id
        : (location ?? ""),
    active: obj.status === "active",
  };
}

async function resolveLocation(
  payload: Awaited<ReturnType<typeof getPayload>>,
  needle: { kind: "id"; id: string | number } | { kind: "slug"; slug: string },
): Promise<ResolvedLocation | null> {
  let doc: unknown;
  if (needle.kind === "id") {
    try {
      doc = await payload.findByID({ collection: "locations", id: needle.id });
    } catch {
      doc = null;
    }
  } else {
    const { docs } = await payload.find({
      collection: "locations",
      where: { slug: { equals: needle.slug } },
      limit: 1,
    });
    doc = docs[0] ?? null;
  }
  if (!doc) return null;
  const obj = doc as {
    id: string | number;
    name?: string;
    slug?: string;
    vatPercent?: number;
    serviceChargePercent?: number;
    allowedPaymentProviders?: ReadonlyArray<string>;
  };
  return {
    id: obj.id,
    name: obj.name ?? "",
    slug: obj.slug ?? "",
    vatPercent: asNumber(obj.vatPercent, 14),
    serviceChargePercent: asNumber(obj.serviceChargePercent, 12),
    allowedPaymentProviders: obj.allowedPaymentProviders ?? [
      "stripe",
      "cash-on-pickup",
    ],
  };
}

async function fetchMenuItems(
  payload: Awaited<ReturnType<typeof getPayload>>,
  locale: "en" | "ar" | "es",
  locationId: string | number | null,
): Promise<MenuViewItem[]> {
  const { docs } = await payload.find({
    collection: "products",
    where: { _status: { equals: "published" } },
    limit: 200,
    locale,
  });

  type RawSize = {
    label?: string;
    value?: string;
    priceInUSD?: number;
  };
  type RawOverride = {
    location?: { id: string | number } | string | number;
    priceInUSD?: number;
    isAvailable?: boolean | null;
  };
  type RawItem = {
    id: string | number;
    name?: string;
    description?: string;
    menuSection?: string;
    priceInUSD?: number;
    allergens?: ReadonlyArray<string>;
    sizes?: ReadonlyArray<RawSize>;
    isAvailable?: boolean;
    unavailableUntil?: string | null;
    locationOverrides?: ReadonlyArray<RawOverride>;
  };

  return asArray<RawItem>(docs).map<MenuViewItem>((doc) => {
    const override = locationId
      ? doc.locationOverrides?.find((o) => {
          const ref = typeof o.location === "object" ? o.location?.id : o.location;
          return String(ref) === String(locationId);
        })
      : undefined;

    const basePrice = asNumber(
      override?.priceInUSD ?? doc.priceInUSD,
      0,
    );
    const restaurantAvailable = doc.isAvailable !== false;
    const branchAvailable =
      override && typeof override.isAvailable === "boolean"
        ? override.isAvailable
        : restaurantAvailable;

    return {
      id: doc.id,
      name: asString(doc.name, "Unnamed"),
      description: asString(doc.description, ""),
      section: asString(doc.menuSection, SECTION_FALLBACK),
      basePriceQirsh: basePrice,
      allergens: doc.allergens ?? [],
      sizes: asArray<RawSize>(doc.sizes).map((s) => ({
        label: asString(s.label, ""),
        value: asString(s.value, ""),
        priceQirsh: asNumber(s.priceInUSD, basePrice),
      })),
      available: branchAvailable,
    };
  });
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const ctx = resolveMenuContext({ searchParams: params });
  const payload = await getPayload();
  const locale = await getLocale();

  let table: ResolvedTable | null = null;
  let location: ResolvedLocation | null = null;
  let fulfillmentMode: FulfillmentMode;

  if (ctx.kind === "table") {
    table = await resolveTable(payload, ctx.tableShortId);
    if (table) {
      location = await resolveLocation(payload, {
        kind: "id",
        id: table.locationId,
      });
    }
    if (table && !table.active) {
      return <DeactivatedTableView shortId={ctx.tableShortId} />;
    }
    fulfillmentMode = "dine-in";
  } else if (ctx.kind === "pickup") {
    if (ctx.locationSlug) {
      location = await resolveLocation(payload, {
        kind: "slug",
        slug: ctx.locationSlug,
      });
    }
    fulfillmentMode = "pickup";
  } else {
    fulfillmentMode = ctx.mode;
  }

  const items = await fetchMenuItems(
    payload,
    locale,
    location?.id ?? null,
  );

  // Section grouping for the structured list view.
  const sections = Array.from(
    items.reduce((acc, item) => {
      const list = acc.get(item.section) ?? [];
      list.push(item);
      acc.set(item.section, list);
      return acc;
    }, new Map<string, MenuViewItem[]>()),
  ).map(([title, list]) => ({ title, items: list }));

  return (
    <MenuClient
      fulfillmentMode={fulfillmentMode}
      table={
        table
          ? { id: table.id, label: table.label, shortId: table.shortId }
          : null
      }
      location={
        location
          ? {
              id: location.id,
              name: location.name,
              slug: location.slug,
              vatPercent: location.vatPercent,
              serviceChargePercent: location.serviceChargePercent,
            }
          : null
      }
      sections={sections}
    />
  );
}

function DeactivatedTableView({ shortId }: { shortId: string }) {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Table {shortId}
        </p>
        <h1 className="text-3xl font-bold">
          This table is no longer in service.
        </h1>
        <p className="text-muted-foreground">
          Order for pickup instead — we&rsquo;ll have it ready in minutes.
        </p>
        <Link
          href="/menu?mode=pickup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
        >
          Order for pickup
        </Link>
      </div>
    </main>
  );
}
