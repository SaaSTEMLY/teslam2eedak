import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract a usable image `{ url, alt }` from a Payload media relation value.
 * Returns `null` when the relation is unpopulated (just an ID) or missing.
 * Strips the origin so Next.js Image can optimise same-origin media.
 */
/**
 * Format a number according to the given locale.
 * For Arabic locales, this ensures Eastern Arabic numerals are used (٠١٢٣...).
 */
export function formatNumber(num: number, locale?: string): string {
  try {
    // For Arabic locales, explicitly use Eastern Arabic numerals
    const options: Intl.NumberFormatOptions = {
      useGrouping: false,
    };

    // Use Arabic-Indic digits for Arabic locales
    if (locale?.startsWith("ar")) {
      return new Intl.NumberFormat(locale + "-u-nu-arab", options).format(num);
    }

    return new Intl.NumberFormat(locale || "en", options).format(num);
  } catch {
    return String(num);
  }
}

export function resolveMedia(
  value: unknown,
): { url: string; alt: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const media = value as { url?: string | null; alt?: string | null };
  if (!media.url) return null;
  let url = media.url;
  try {
    url = new URL(url).pathname;
  } catch {
    // already relative
  }
  return { url, alt: media.alt ?? "" };
}
