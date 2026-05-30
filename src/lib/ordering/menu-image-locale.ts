/**
 * Pure helper: pick the right menu image url for the active locale.
 *
 * The admin author can upload one image per locale per section (per
 * ADR-0002 — image is monolingual; the hotspot tool authors per-locale
 * versions). Filenames follow the convention `${baseId}-${locale}.jpg`
 * with `${baseId}.jpg` as the en/fallback. We look up the locale-
 * suffixed url first, fall back to the base url, and never block on a
 * 404 (the menu list view is always available as a fallback per
 * GOAL §5).
 */

export interface MenuImageVariants {
  readonly id: string;
  readonly label: string;
  /** Base url, always set. e.g., '/menu1.jpg' */
  readonly baseUrl: string;
  /** Optional per-locale overrides keyed by locale code. */
  readonly localizedUrls?: Readonly<Record<string, string>>;
}

export function pickImageUrlForLocale(
  variants: MenuImageVariants,
  locale: string,
  fallbackLocale: string = "en",
): string {
  const localized = variants.localizedUrls?.[locale];
  if (localized) return localized;
  const fallbackLocalized = variants.localizedUrls?.[fallbackLocale];
  if (fallbackLocalized) return fallbackLocalized;
  return variants.baseUrl;
}

/**
 * Reasonable convention for filename-based lookups: `/menu1.jpg`
 * (default), `/menu1-ar.jpg` (Arabic), `/menu1-es.jpg` (Spanish).
 * The admin can override by setting `localizedUrls` explicitly.
 */
export function defaultLocalizedUrlsForBase(
  baseUrl: string,
): Record<string, string> {
  const match = baseUrl.match(/^(.*)(\.\w+)$/);
  if (!match) return {};
  const [, stem, ext] = match;
  return {
    ar: `${stem}-ar${ext}`,
    es: `${stem}-es${ext}`,
  };
}
