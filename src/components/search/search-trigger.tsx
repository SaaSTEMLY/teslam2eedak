"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "./search-command";

interface SearchTriggerProps {
  translations: {
    searchPlaceholder: string;
    noResults: string;
    noResultsDescription: string;
    typeToSearch: string;
    products: string;
    blogs?: string;
    openSearch: string;
    searchShortcut: string;
  };
  locale?: string;
}

export function SearchTrigger({ translations: t, locale }: SearchTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-foreground hover:bg-accent"
        aria-label={t.openSearch}
      >
        <Search className="size-4" />
      </Button>
      <SearchCommand
        open={open}
        onOpenChange={setOpen}
        translations={t}
        locale={locale}
      />
    </>
  );
}
