/**
 * QR code helpers for table and pickup landing URLs.
 *
 * Table QR encodes `${baseUrl}/menu?t=<shortId>` — the customer hits the
 * menu in dine-in mode, with the cart auto-paired to that table.
 *
 * Pickup QR encodes `${baseUrl}/menu?mode=pickup&l=<locationSlug>` —
 * lands the guest in click-and-collect at that branch.
 *
 * The URL builders are pure for easy testing. SVG/PNG generation
 * delegates to the `qrcode` npm package.
 */

import QRCode from "qrcode";

export interface BaseUrlInput {
  readonly baseUrl: string;
}

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

export function buildTableMenuUrl(
  input: BaseUrlInput & { readonly tableShortId: string },
): string {
  const base = stripTrailingSlash(input.baseUrl);
  return `${base}/menu?t=${encodeURIComponent(input.tableShortId)}`;
}

export function buildPickupMenuUrl(
  input: BaseUrlInput & { readonly locationSlug?: string },
): string {
  const base = stripTrailingSlash(input.baseUrl);
  if (input.locationSlug) {
    return `${base}/menu?mode=pickup&l=${encodeURIComponent(input.locationSlug)}`;
  }
  return `${base}/menu?mode=pickup`;
}

export interface QrSvgOptions {
  /** SVG side length in px. The `qrcode` lib renders a square. */
  readonly width?: number;
  /** Margin in QR modules (units, not pixels). 0–4 typical. Default 2. */
  readonly margin?: number;
  /** Foreground colour, default brand sage. */
  readonly darkColor?: string;
  /** Background colour, default brand cream. */
  readonly lightColor?: string;
  /** Error-correction level — 'H' (high) lets us overlay a logo. */
  readonly errorCorrection?: "L" | "M" | "Q" | "H";
}

/**
 * Render a QR code as an SVG string. Designed for inline embedding in
 * HTML print pages and direct HTTP responses (Content-Type: image/svg+xml).
 */
export async function renderQrSvg(
  url: string,
  options: QrSvgOptions = {},
): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    width: options.width ?? 320,
    margin: options.margin ?? 2,
    errorCorrectionLevel: options.errorCorrection ?? "H",
    color: {
      dark: options.darkColor ?? "#7a8f4f",
      light: options.lightColor ?? "#f2ead0",
    },
  });
}

/** Render a QR as a Data URL PNG. Useful for embedding in PDFs or canvas. */
export async function renderQrDataUrl(
  url: string,
  options: QrSvgOptions = {},
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: options.width ?? 512,
    margin: options.margin ?? 2,
    errorCorrectionLevel: options.errorCorrection ?? "H",
    color: {
      dark: options.darkColor ?? "#7a8f4f",
      light: options.lightColor ?? "#f2ead0",
    },
  });
}
