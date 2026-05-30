import { cookies } from "next/headers";

export type SupportedLocale = "en" | "ar" | "es";

const VALID_LOCALES: Set<string> = new Set(["en", "ar", "es"]);

/** Read the current locale from cookies (server-side only). */
export async function getLocale(): Promise<SupportedLocale> {
  const value = (await cookies()).get("locale")?.value;
  return value && VALID_LOCALES.has(value) ? (value as SupportedLocale) : "en";
}
