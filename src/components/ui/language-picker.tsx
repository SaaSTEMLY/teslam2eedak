"use client";

import { useCallback, useState } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const locales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

type Locale = (typeof locales)[number]["code"];

interface LanguagePickerProps {
  initialLocale?: string;
  className?: string;
}

export function LanguagePicker({
  initialLocale = "en",
  className,
}: LanguagePickerProps) {
  const [current, setCurrent] = useState<Locale>(
    (locales.find((l) => l.code === initialLocale)?.code ?? "en") as Locale,
  );

  const switchLocale = useCallback((locale: Locale) => {
    setCurrent(locale);
    document.cookie = `locale=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    window.location.reload();
  }, []);

  const currentLocale = locales.find((l) => l.code === current)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer",
            className,
          )}
          aria-label={`Language: ${currentLocale.label}`}
        >
          <Languages className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale.code}
            onClick={() => switchLocale(locale.code)}
            className={cn(
              "gap-2 cursor-pointer",
              current === locale.code && "font-semibold bg-accent",
            )}
          >
            <span>{locale.flag}</span>
            <span>{locale.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
