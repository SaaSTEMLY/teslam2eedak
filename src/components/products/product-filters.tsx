"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
  translations: {
    searchPlaceholder: string;
    allCategories: string;
    sortNewest: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortNameAsc: string;
    clearFilters: string;
    [key: string]: string;
  };
  categories: { value: string; label: string }[];
}

export function ProductFilters({
  translations: m,
  categories,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "newest";

  const [searchInput, setSearchInput] = useState(currentSearch);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      startTransition(() => {
        router.push(`/products?${params.toString()}`, { scroll: false });
      });
    },
    [router, searchParams],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    startTransition(() => {
      router.push("/products", { scroll: false });
    });
  };

  const hasActiveFilters =
    currentSearch || currentCategory || currentSort !== "newest";

  return (
    <div className="mt-10 space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={m.searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => {
              if (searchInput !== currentSearch) {
                updateParams({ q: searchInput });
              }
            }}
            className="ps-9 pe-9 h-10 rounded-xl"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ q: "" });
              }}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </form>

        <Select
          value={currentSort}
          onValueChange={(value) => updateParams({ sort: value })}
        >
          <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{m.sortNewest}</SelectItem>
            <SelectItem value="price_asc">{m.sortPriceAsc}</SelectItem>
            <SelectItem value="price_desc">{m.sortPriceDesc}</SelectItem>
            <SelectItem value="name_asc">{m.sortNameAsc}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => updateParams({ category: "" })}
          className={cn(
            "inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
            !currentCategory
              ? "bg-foreground text-background"
              : "bg-muted text-muted-foreground hover:text-foreground",
          )}
        >
          {m.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() =>
              updateParams({
                category: currentCategory === cat.value ? "" : cat.value,
              })
            }
            className={cn(
              "inline-flex items-center px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentCategory === cat.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {cat.label}
          </button>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <X className="size-3" />
            {m.clearFilters}
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="h-0.5 w-full bg-muted overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary animate-pulse rounded-full" />
        </div>
      )}
    </div>
  );
}
