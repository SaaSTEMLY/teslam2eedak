"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { Search, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductHit {
  id: string;
  score: number;
  document: {
    name?: string;
    slug?: string;
    description?: string;
    priceInUSD?: number;
    category?: string;
    imageUrl?: string;
  };
}

interface BlogHit {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl?: string;
}

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  translations: {
    searchPlaceholder: string;
    noResults: string;
    noResultsDescription: string;
    typeToSearch: string;
    products: string;
    blogs?: string;
  };
  locale?: string;
}

export function SearchCommand({
  open,
  onOpenChange,
  translations: t,
  locale,
}: SearchCommandProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [blogs, setBlogs] = useState<BlogHit[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setProducts([]);
        setBlogs([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&limit=8&locale=${locale ?? "en"}`,
        );
        const data = await res.json();
        setProducts(data.products ?? data.hits ?? []);
        setBlogs(data.blogs ?? []);
      } catch {
        setProducts([]);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setProducts([]);
      setBlogs([]);
    }
  }, [open]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const hasResults = products.length > 0 || blogs.length > 0;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-x-0 top-0 mx-auto max-w-xl pt-[15vh] px-4">
        <CommandPrimitive
          className="rounded-xl border border-border bg-background shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          <div className="flex items-center border-b border-border px-4">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder={t.searchPlaceholder}
              className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none ps-3"
            />
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <CommandPrimitive.List className="max-h-80 overflow-y-auto p-2">
            {loading && (
              <CommandPrimitive.Loading>
                <div className="py-6 text-center text-sm text-muted-foreground">
                  ...
                </div>
              </CommandPrimitive.Loading>
            )}

            {!loading && query && !hasResults && (
              <CommandPrimitive.Empty className="py-6 text-center">
                <p className="text-sm text-muted-foreground">{t.noResults}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {t.noResultsDescription}
                </p>
              </CommandPrimitive.Empty>
            )}

            {!query && !loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t.typeToSearch}
              </div>
            )}

            {products.length > 0 && (
              <CommandPrimitive.Group heading={t.products}>
                {products.map((hit) => (
                  <CommandPrimitive.Item
                    key={`product-${hit.id}`}
                    value={`product-${hit.id}`}
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(`/products/${hit.document.slug}`);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-foreground data-[selected=true]:bg-accent transition-colors"
                  >
                    {hit.document.imageUrl ? (
                      <div className="relative size-10 rounded-md overflow-hidden bg-muted shrink-0">
                        <Image
                          src={hit.document.imageUrl}
                          alt={hit.document.name ?? ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-10 rounded-md bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {hit.document.name}
                      </p>
                      {hit.document.category && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {hit.document.category}
                        </p>
                      )}
                    </div>
                    {hit.document.priceInUSD != null && (
                      <span
                        className={cn(
                          "text-sm font-medium shrink-0",
                          hit.document.priceInUSD === 0
                            ? "text-green-600"
                            : "text-foreground",
                        )}
                      >
                        {hit.document.priceInUSD === 0
                          ? "Free"
                          : `$${(hit.document.priceInUSD / 100).toFixed(2)}`}
                      </span>
                    )}
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}

            {blogs.length > 0 && (
              <CommandPrimitive.Group heading={t.blogs ?? "Blog Posts"}>
                {blogs.map((hit) => (
                  <CommandPrimitive.Item
                    key={`blog-${hit.id}`}
                    value={`blog-${hit.id}`}
                    onSelect={() => {
                      onOpenChange(false);
                      router.push(`/blogs/${hit.slug}`);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-foreground data-[selected=true]:bg-accent transition-colors"
                  >
                    {hit.coverImageUrl ? (
                      <div className="relative size-10 rounded-md overflow-hidden bg-muted shrink-0">
                        <Image
                          src={hit.coverImageUrl}
                          alt={hit.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-10 rounded-md bg-muted shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{hit.title}</p>
                      <p className="text-xs text-muted-foreground capitalize truncate">
                        {hit.category}
                        {hit.excerpt && ` · ${hit.excerpt}`}
                      </p>
                    </div>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            )}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </div>
    </div>
  );
}
