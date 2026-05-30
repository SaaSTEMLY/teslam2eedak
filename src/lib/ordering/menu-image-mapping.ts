/**
 * Pure helper: build the per-image-section structure consumed by the
 * MenuImageView client component.
 *
 * Customer menu items each carry a `hotspotBoxes` JSON array with shape
 *   { locale, menuImageId, x, y, w, h }.
 *
 * Given the current locale and an ordered list of menu images (one per
 * section), this returns an array of `{ image, hotspots[] }` rows where
 * each hotspot pulls in the (already-prepared) menu item record so the
 * client component can render the overlay + dispatch onSelect with
 * everything it needs.
 */

export interface MenuImage {
  readonly id: string;
  readonly url: string;
  readonly label: string;
}

export interface HotspotRecord {
  readonly locale: string;
  readonly menuImageId: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface MappingItem {
  readonly id: string | number;
  readonly hotspots: ReadonlyArray<HotspotRecord>;
}

export interface SectionMapping<T extends MappingItem> {
  readonly image: MenuImage;
  readonly hotspots: ReadonlyArray<{
    readonly item: T;
    readonly box: HotspotRecord;
  }>;
}

export function mapHotspotsToSections<T extends MappingItem>(input: {
  readonly images: ReadonlyArray<MenuImage>;
  readonly items: ReadonlyArray<T>;
  readonly locale: string;
}): ReadonlyArray<SectionMapping<T>> {
  return input.images.map((image) => {
    const hotspots: Array<{ item: T; box: HotspotRecord }> = [];
    for (const item of input.items) {
      for (const box of item.hotspots) {
        if (box.menuImageId === image.id && box.locale === input.locale) {
          hotspots.push({ item, box });
        }
      }
    }
    return { image, hotspots };
  });
}
