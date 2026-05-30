/**
 * Pure helpers for menu-image hotspot authoring (per ADR-0002).
 *
 * Hotspots are stored as { locale, menuImageId, x, y, w, h } where x/y/w/h
 * are normalized into [0, 1] so the same record renders correctly at any
 * displayed image size. Authoring is desktop-only (GOAL §14).
 */

export interface Hotspot {
  readonly locale: string;
  readonly menuImageId: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface PixelRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export interface ImageDimensions {
  readonly displayedWidth: number;
  readonly displayedHeight: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Convert a pixel-space rect drawn on a displayed image to a normalized
 * 0–1 rect. Negative widths/heights (drag right-to-left) are normalized.
 */
export function rectToNormalized(
  rect: PixelRect,
  dims: ImageDimensions,
): { x: number; y: number; w: number; h: number } {
  const x0 = rect.w < 0 ? rect.x + rect.w : rect.x;
  const y0 = rect.h < 0 ? rect.y + rect.h : rect.y;
  const w = Math.abs(rect.w);
  const h = Math.abs(rect.h);
  return {
    x: clamp01(x0 / dims.displayedWidth),
    y: clamp01(y0 / dims.displayedHeight),
    w: clamp01(w / dims.displayedWidth),
    h: clamp01(h / dims.displayedHeight),
  };
}

/** Inverse: convert a normalized rect back to pixel-space at the current
 * displayed size. */
export function normalizedToRect(
  hotspot: { x: number; y: number; w: number; h: number },
  dims: ImageDimensions,
): PixelRect {
  return {
    x: hotspot.x * dims.displayedWidth,
    y: hotspot.y * dims.displayedHeight,
    w: hotspot.w * dims.displayedWidth,
    h: hotspot.h * dims.displayedHeight,
  };
}

/** Whether a normalized (x, y) point falls inside a hotspot. */
export function hitTest(
  point: { x: number; y: number },
  hotspot: { x: number; y: number; w: number; h: number },
): boolean {
  return (
    point.x >= hotspot.x &&
    point.x <= hotspot.x + hotspot.w &&
    point.y >= hotspot.y &&
    point.y <= hotspot.y + hotspot.h
  );
}

export type HotspotValidationError =
  | { kind: "out-of-bounds" }
  | { kind: "too-small"; min: number }
  | { kind: "missing-link" };

/**
 * Validate a hotspot record before saving. Hotspots must be inside the
 * normalized image, at least 2% of width / height (so the customer can
 * actually tap them), and linked to a menu item id.
 */
export function validateHotspot(
  hotspot: Hotspot & { menuItemId?: string | number | null },
): HotspotValidationError | null {
  if (
    hotspot.x < 0 ||
    hotspot.y < 0 ||
    hotspot.x + hotspot.w > 1 ||
    hotspot.y + hotspot.h > 1
  ) {
    return { kind: "out-of-bounds" };
  }
  const MIN = 0.02;
  if (hotspot.w < MIN || hotspot.h < MIN) {
    return { kind: "too-small", min: MIN };
  }
  if (
    hotspot.menuItemId === undefined ||
    hotspot.menuItemId === null ||
    hotspot.menuItemId === ""
  ) {
    return { kind: "missing-link" };
  }
  return null;
}
