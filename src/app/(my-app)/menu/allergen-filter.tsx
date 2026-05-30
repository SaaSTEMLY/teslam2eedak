"use client";

import { Leaf, Wheat, Milk, Drumstick } from "lucide-react";

import { cn } from "@/lib/utils";
import type { DietaryPreference } from "@/lib/ordering/menu-filter";

const TOGGLES: ReadonlyArray<{
  value: DietaryPreference;
  label: string;
  Icon: typeof Leaf;
}> = [
  { value: "vegan", label: "Vegan", Icon: Leaf },
  { value: "vegetarian", label: "Vegetarian", Icon: Drumstick },
  { value: "gluten-free", label: "GF", Icon: Wheat },
  { value: "dairy-free", label: "Dairy-free", Icon: Milk },
];

interface AllergenFilterProps {
  value: ReadonlyArray<DietaryPreference>;
  onChange: (next: ReadonlyArray<DietaryPreference>) => void;
}

export function AllergenFilter({ value, onChange }: AllergenFilterProps) {
  const set = new Set(value);

  return (
    <div
      role="group"
      aria-label="Dietary preferences"
      className="flex items-center gap-2 overflow-x-auto"
    >
      {TOGGLES.map(({ value: pref, label, Icon }) => {
        const active = set.has(pref);
        return (
          <button
            key={pref}
            type="button"
            aria-pressed={active}
            onClick={() => {
              const next = new Set(set);
              if (next.has(pref)) {
                next.delete(pref);
              } else {
                next.add(pref);
              }
              onChange(Array.from(next));
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground/80 border-border/60 hover:border-foreground/30",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
