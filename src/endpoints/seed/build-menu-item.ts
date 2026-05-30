/**
 * Pure transform: take a MenuItemSeed + the maps of seeded location and
 * modifier-group ids, and return the data payload ready for
 * `payload.create({ collection: 'products', data })`.
 *
 * Kept separate from the seed runner so it can be exercised by unit
 * tests without spinning up a Payload instance.
 */

import type { MenuItemSeed } from "./menu-items";

export interface MenuItemPayload {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly category: MenuItemSeed["category"];
  readonly menuSection: string;
  readonly priceInUSD: number;
  readonly allergens: ReadonlyArray<string>;
  readonly prepTimeMinutes: number;
  readonly isAvailable: true;
  readonly restaurantId: "kk-main";
  readonly modifierGroups: ReadonlyArray<string | number>;
  readonly sizes?: ReadonlyArray<{
    readonly label: string;
    readonly value: string;
    readonly priceInUSD: number;
    readonly isDefault: boolean;
  }>;
  readonly _status: "published";
}

export interface BuildMenuItemInput {
  readonly item: MenuItemSeed;
  readonly modifierGroupIdBySlug: ReadonlyMap<string, string | number>;
  readonly locale: "en" | "ar" | "es";
}

export function buildMenuItemPayload(
  input: BuildMenuItemInput,
): MenuItemPayload {
  const { item, locale, modifierGroupIdBySlug } = input;
  const modifierGroups = item.modifierGroupSlugs.map((slug) => {
    const id = modifierGroupIdBySlug.get(slug);
    if (id === undefined) {
      throw new Error(
        `Menu item "${item.slug}" references unknown modifier-group "${slug}"`,
      );
    }
    return id;
  });

  return {
    name: item.name[locale] ?? item.name.en,
    slug: item.slug,
    description: item.description[locale] ?? item.description.en,
    category: item.category,
    menuSection: item.menuSection[locale === "ar" ? "ar" : "en"],
    priceInUSD: item.basePriceQirsh,
    allergens: item.allergens ?? [],
    prepTimeMinutes: item.prepTimeMinutes,
    isAvailable: true,
    restaurantId: "kk-main",
    modifierGroups,
    sizes: item.sizes?.map((s) => ({
      label: s.label[locale === "ar" ? "ar" : "en"],
      value: s.value,
      priceInUSD: s.priceQirsh,
      isDefault: s.isDefault === true,
    })),
    _status: "published",
  };
}
