"use client";

import { cn } from "@/lib/utils";

interface MenuListItem {
  id: string | number;
  name: string;
  description: string;
  section: string;
  basePriceQirsh: number;
  allergens: ReadonlyArray<string>;
  sizes: ReadonlyArray<{ label: string; value: string; priceQirsh: number }>;
  available: boolean;
}

interface MenuListViewProps {
  sections: ReadonlyArray<{
    title: string;
    items: ReadonlyArray<{ item: MenuListItem; dimmed: boolean }>;
  }>;
  onItemSelect?: (itemId: string | number) => void;
}

function formatLE(qirsh: number): string {
  return `${(qirsh / 100).toFixed(0)} LE`;
}

export function MenuListView({ sections, onItemSelect }: MenuListViewProps) {
  if (sections.length === 0) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
        Nothing on the menu yet. Check back soon.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4">
      {sections.map((section) => (
        <section
          key={section.title}
          className="py-8 border-b border-border/40 last:border-b-0"
        >
          <h2 className="text-xs uppercase tracking-[0.22em] text-primary font-bold mb-4">
            {section.title}
          </h2>
          <ul className="divide-y divide-border/30">
            {section.items.map(({ item, dimmed }) => {
              const disabled = !item.available || dimmed;
              const priceLabel =
                item.sizes.length > 0
                  ? item.sizes
                      .map((s) => `${s.label} ${formatLE(s.priceQirsh)}`)
                      .join(" · ")
                  : formatLE(item.basePriceQirsh);

              return (
                <li key={item.id} className="py-3">
                  <button
                    type="button"
                    aria-disabled={disabled}
                    disabled={disabled}
                    onClick={() => !disabled && onItemSelect?.(item.id)}
                    className={cn(
                      "w-full text-left flex items-baseline justify-between gap-3 transition",
                      "rounded-lg -mx-3 px-3 py-2",
                      disabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-card",
                    )}
                    title={
                      !item.available
                        ? "Sold out"
                        : dimmed
                          ? "Does not match active filters"
                          : item.description
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {item.name}
                        </span>
                        {!item.available ? (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold">
                            SOLD OUT
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      ) : null}
                      {item.allergens.length > 0 ? (
                        <div className="mt-1 flex gap-1.5 flex-wrap">
                          {item.allergens.slice(0, 4).map((a) => (
                            <span
                              key={a}
                              className="text-[10px] uppercase tracking-wide rounded-full bg-secondary/40 px-1.5 py-0.5 text-foreground/70"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-foreground font-bold whitespace-nowrap">
                      {priceLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
