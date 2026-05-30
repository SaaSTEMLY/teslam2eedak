"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  rectToNormalized,
  validateHotspot,
  type Hotspot,
} from "@/lib/ordering/hotspot";
import { Button } from "@/components/ui/button";

interface ItemRow {
  id: string | number;
  name: string;
  currentHotspot?: {
    locale?: string;
    menuImageId?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  };
}

interface HotspotEditorProps {
  imageId: string;
  imageUrl: string;
  imageLabel: string;
  items: ReadonlyArray<ItemRow>;
}

type Drag =
  | { phase: "idle" }
  | {
      phase: "drawing";
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    };

export function HotspotEditor(props: HotspotEditorProps) {
  const [locale, setLocale] = useState<"en" | "ar" | "es">("en");
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(
    null,
  );
  const [drag, setDrag] = useState<Drag>({ phase: "idle" });
  const [savingId, setSavingId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStamp, setSavedStamp] = useState<string>("");
  const [pendingHotspots, setPendingHotspots] = useState<
    Record<string, { x: number; y: number; w: number; h: number }>
  >({});
  const imgRef = useRef<HTMLDivElement | null>(null);

  const localItems = props.items.map((it) => {
    const pending = pendingHotspots[String(it.id)];
    const stored =
      it.currentHotspot && it.currentHotspot.menuImageId === props.imageId
        ? {
            x: it.currentHotspot.x ?? 0,
            y: it.currentHotspot.y ?? 0,
            w: it.currentHotspot.w ?? 0,
            h: it.currentHotspot.h ?? 0,
          }
        : null;
    return { ...it, hotspot: pending ?? stored };
  });

  const startDraw = (e: React.PointerEvent<HTMLDivElement>) => {
    if (selectedItemId === null) {
      setError("Pick a menu item first to assign the box you draw.");
      return;
    }
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setError(null);
    setDrag({
      phase: "drawing",
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  };

  const moveDraw = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.phase !== "drawing" || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    setDrag({
      ...drag,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  };

  const endDraw = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.phase !== "drawing" || !imgRef.current || selectedItemId === null) {
      setDrag({ phase: "idle" });
      return;
    }
    const rect = imgRef.current.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const normalized = rectToNormalized(
      {
        x: drag.startX,
        y: drag.startY,
        w: endX - drag.startX,
        h: endY - drag.startY,
      },
      { displayedWidth: rect.width, displayedHeight: rect.height },
    );
    const candidate: Hotspot & { menuItemId: string | number } = {
      locale,
      menuImageId: props.imageId,
      ...normalized,
      menuItemId: selectedItemId,
    };
    const v = validateHotspot(candidate);
    if (v) {
      setError(
        v.kind === "too-small"
          ? "Hotspot too small — drag a larger rectangle."
          : v.kind === "out-of-bounds"
            ? "Hotspot extends past the image."
            : "Pick a menu item to link to.",
      );
      setDrag({ phase: "idle" });
      return;
    }
    setPendingHotspots((p) => ({
      ...p,
      [String(selectedItemId)]: normalized,
    }));
    setDrag({ phase: "idle" });
  };

  const save = useCallback(
    async (item: ItemRow & { hotspot: { x: number; y: number; w: number; h: number } | null }) => {
      if (!item.hotspot) return;
      setSavingId(item.id);
      setError(null);
      try {
        const others = (
          Array.isArray(item.currentHotspot) ? item.currentHotspot : []
        ) as ReadonlyArray<{ menuImageId?: string }>;
        const hotspotBoxes = [
          ...others.filter(
            (h) => h.menuImageId && h.menuImageId !== props.imageId,
          ),
          {
            locale,
            menuImageId: props.imageId,
            ...item.hotspot,
          },
        ];
        const res = await fetch(`/api/products/${item.id}/hotspots`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hotspotBoxes }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as
            | { error?: string }
            | null;
          setError(body?.error ?? "Failed to save");
          return;
        }
        setSavedStamp(`Saved ${item.name}`);
      } catch {
        setError("Network error.");
      } finally {
        setSavingId(null);
      }
    },
    [locale, props.imageId],
  );

  return (
    <main className="min-h-[80vh] py-6 px-3" id="main-content">
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <section>
          <header className="flex items-center gap-3 mb-3">
            <h1 className="font-serif text-2xl font-bold">
              {props.imageLabel}
            </h1>
            <select
              value={locale}
              onChange={(e) =>
                setLocale(e.target.value as "en" | "ar" | "es")
              }
              className="rounded-md border border-border bg-card px-2 py-1 text-sm"
            >
              <option value="en">en</option>
              <option value="ar">ar</option>
              <option value="es">es</option>
            </select>
          </header>

          <div
            ref={imgRef}
            onPointerDown={startDraw}
            onPointerMove={moveDraw}
            onPointerUp={endDraw}
            className="relative inline-block cursor-crosshair select-none border border-border rounded-xl overflow-hidden"
          >
            <Image
              src={props.imageUrl}
              alt={props.imageLabel}
              width={900}
              height={1200}
              priority
              className="block max-h-[80vh] w-auto"
            />
            {localItems
              .filter((it) => it.hotspot)
              .map((it) => {
                const hs = it.hotspot!;
                return (
                  <div
                    key={`saved-${it.id}`}
                    className={cn(
                      "absolute pointer-events-none border-2 rounded-md",
                      String(it.id) === String(selectedItemId)
                        ? "border-primary bg-primary/10"
                        : "border-accent/70 bg-accent/10",
                    )}
                    style={{
                      left: `${hs.x * 100}%`,
                      top: `${hs.y * 100}%`,
                      width: `${hs.w * 100}%`,
                      height: `${hs.h * 100}%`,
                    }}
                    aria-label={`Hotspot for ${it.name}`}
                  >
                    <span className="absolute -top-5 left-0 text-[10px] font-bold text-foreground bg-background/80 px-1 rounded">
                      {it.name}
                    </span>
                  </div>
                );
              })}
            {drag.phase === "drawing" ? (
              <div
                className="absolute pointer-events-none border-2 border-primary bg-primary/20 rounded-md"
                style={{
                  left: Math.min(drag.startX, drag.currentX),
                  top: Math.min(drag.startY, drag.currentY),
                  width: Math.abs(drag.currentX - drag.startX),
                  height: Math.abs(drag.currentY - drag.startY),
                }}
              />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Click + drag to draw a rectangle around a menu item printed on
            the image. Pick the matching item on the right first.
          </p>
        </section>

        <aside className="space-y-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2">
              Items
            </h2>
            <input
              type="text"
              aria-label="Filter items"
              placeholder="Filter…"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                document.querySelectorAll<HTMLLIElement>("[data-item]").forEach(
                  (el) => {
                    el.style.display =
                      !q || el.dataset.name?.toLowerCase().includes(q)
                        ? ""
                        : "none";
                  },
                );
              }}
              className="w-full rounded-md border border-border bg-card px-2 py-1 text-sm mb-2"
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
          {savedStamp ? (
            <p className="text-sm text-primary">{savedStamp}</p>
          ) : null}
          <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
            {localItems.map((it) => {
              const active = String(it.id) === String(selectedItemId);
              const hasHotspot = !!it.hotspot;
              return (
                <li
                  key={String(it.id)}
                  data-item
                  data-name={it.name}
                  className={cn(
                    "rounded-lg border p-2 cursor-pointer transition",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                  onClick={() => setSelectedItemId(it.id)}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold truncate">
                      {it.name}
                    </span>
                    {hasHotspot ? (
                      <span className="text-[10px] uppercase text-primary">
                        ✓
                      </span>
                    ) : null}
                  </div>
                  {hasHotspot ? (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        disabled={savingId !== null}
                        onClick={(e) => {
                          e.stopPropagation();
                          void save(it);
                        }}
                      >
                        {savingId === it.id ? "Saving…" : "Save"}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </main>
  );
}
