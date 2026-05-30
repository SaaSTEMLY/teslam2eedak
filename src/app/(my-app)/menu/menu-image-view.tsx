"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";
import type { HotspotRecord } from "@/lib/ordering/menu-image-mapping";

interface ImageItem {
  id: string | number;
  name: string;
  available: boolean;
}

interface MenuImageViewProps {
  sections: ReadonlyArray<{
    image: { id: string; url: string; label: string };
    hotspots: ReadonlyArray<{
      item: ImageItem;
      box: HotspotRecord;
      dimmed: boolean;
    }>;
  }>;
  onItemSelect: (itemId: string | number) => void;
}

export function MenuImageView({ sections, onItemSelect }: MenuImageViewProps) {
  const empty = sections.every((s) => s.hotspots.length === 0);

  return (
    <div className="mx-auto max-w-3xl px-4 space-y-10 py-6">
      {empty ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          No items mapped on the printed menu yet. Use the structured list
          view in the meantime.
        </p>
      ) : null}
      {sections.map((section) => (
        <section key={section.image.id} className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.22em] text-primary font-bold px-1">
            {section.image.label}
          </h2>
          <div className="relative rounded-2xl overflow-hidden border border-border bg-card">
            <Image
              src={section.image.url}
              alt={section.image.label}
              width={1200}
              height={1600}
              priority={false}
              className="block w-full h-auto"
            />
            {section.hotspots.map(({ item, box, dimmed }, i) => {
              const disabled = !item.available || dimmed;
              return (
                <button
                  key={`${item.id}-${i}`}
                  type="button"
                  aria-label={item.name}
                  disabled={disabled}
                  onClick={() => !disabled && onItemSelect(item.id)}
                  style={{
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                  }}
                  className={cn(
                    "absolute rounded-md transition focus:outline-2 focus:outline-offset-2 focus:outline-primary",
                    disabled
                      ? "bg-background/55 cursor-not-allowed"
                      : "bg-primary/0 hover:bg-primary/15 active:bg-primary/25 ring-1 ring-transparent hover:ring-primary/60",
                  )}
                >
                  {!item.available ? (
                    <span className="absolute inset-0 grid place-items-center text-[10px] font-bold tracking-wider text-destructive bg-background/70 rounded-md">
                      SOLD OUT
                    </span>
                  ) : null}
                  <span className="sr-only">{item.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
