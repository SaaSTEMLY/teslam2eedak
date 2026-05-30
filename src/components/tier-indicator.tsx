"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import CustomLink from "@/components/Link/customLink";

import styles from "./tier-indicator.module.css";

const LITE_PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
  "/license",
  "/blogs",
];
const PRO_PATHS = [
  "/products",
  "/checkout",
  "/account",
  "/auth",
  "/admin",
  "/delete-account",
];

const i18n = {
  en: { lite: "Included in LITE", pro: "Included in PRO", cta: "Buy Template" },
  ar: { lite: "مُضمَّن في LITE", pro: "مُضمَّن في PRO", cta: "شراء القالب" },
  es: {
    lite: "Incluido en LITE",
    pro: "Incluido en PRO",
    cta: "Comprar Plantilla",
  },
} as const;

type Locale = keyof typeof i18n;

function getTier(pathname: string): "lite" | "pro" | null {
  if (
    LITE_PATHS.some(
      (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")),
    )
  ) {
    return "lite";
  }
  if (PRO_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return "pro";
  }
  return null;
}

const noop = () => () => {};
const getLocale = (): Locale => {
  const lang = document.documentElement.lang;
  return lang in i18n ? (lang as Locale) : "en";
};
const getServerLocale = (): Locale => "en";

function useLocale(): Locale {
  return useSyncExternalStore(noop, getLocale, getServerLocale);
}

export function TierIndicator() {
  const pathname = usePathname();
  const tier = getTier(pathname);
  const locale = useLocale();

  if (!tier) return null;

  const isLite = tier === "lite";
  const t = i18n[locale];

  return (
    <div className={styles.container}>
      <div
        className={`${styles.pill} ${isLite ? styles.pillLite : styles.pillPro}`}
      >
        <span
          className={`${styles.dot} ${isLite ? styles.dotLite : styles.dotPro}`}
        />
        <div className={styles.text}>
          <span className={styles.label}>{isLite ? t.lite : t.pro}</span>
          <CustomLink href="/products/saastarter" className={styles.cta}>
            {t.cta}
          </CustomLink>
        </div>
      </div>
    </div>
  );
}
