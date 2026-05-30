/**
 * Seed the hotspot_boxes JSON field on the menu-item products, using
 * normalized coordinates produced by a Claude-vision agent that read
 * the printed menu jpgs (see VISION_HOTSPOTS below for the source).
 *
 * Writes one hotspot per (item, locale) — both `en` and `ar` get the
 * same coordinates since menu1/2/3.jpg are shared across locales until
 * KK commissions Arabic versions of the printed menu (per ADR-0002 +
 * chunk B mapHotspotsToSections, which filters by locale).
 *
 *   bun scripts/seed-hotspots.ts
 *
 * Idempotent — re-running replaces the hotspot_boxes array, doesn't
 * append.
 */
import { createClient } from "@libsql/client";

interface BoxFromVision {
  slug: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const VISION_HOTSPOTS: Record<string, BoxFromVision[]> = {
  menu1: [
    { slug: "espresso", x: 0.04, y: 0.135, w: 0.42, h: 0.025 },
    { slug: "flat-white", x: 0.04, y: 0.215, w: 0.42, h: 0.025 },
    { slug: "spanish-latte", x: 0.04, y: 0.265, w: 0.42, h: 0.025 },
    { slug: "salted-karamel", x: 0.04, y: 0.305, w: 0.42, h: 0.025 },
    { slug: "iced-latte", x: 0.04, y: 0.435, w: 0.42, h: 0.025 },
    { slug: "iced-salted-caramel", x: 0.04, y: 0.535, w: 0.42, h: 0.025 },
    { slug: "caramel-klassic", x: 0.52, y: 0.245, w: 0.44, h: 0.025 },
  ],
  menu3: [
    { slug: "salty-truffle-bagel", x: 0.04, y: 0.395, w: 0.42, h: 0.025 },
    { slug: "philly-steak-wich", x: 0.04, y: 0.755, w: 0.42, h: 0.025 },
    { slug: "quinoa-lover", x: 0.52, y: 0.305, w: 0.44, h: 0.025 },
    { slug: "mood-boost-salad", x: 0.52, y: 0.435, w: 0.44, h: 0.025 },
    { slug: "kult-made-cookies", x: 0.52, y: 0.825, w: 0.44, h: 0.025 },
  ],
};

const LOCALES = ["en", "ar"] as const;

interface Hotspot {
  locale: string;
  menuImageId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildPerSlug(): Map<string, Hotspot[]> {
  const out = new Map<string, Hotspot[]>();
  for (const [menuImageId, boxes] of Object.entries(VISION_HOTSPOTS)) {
    for (const b of boxes) {
      const arr = out.get(b.slug) ?? [];
      for (const locale of LOCALES) {
        arr.push({
          locale,
          menuImageId,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
        });
      }
      out.set(b.slug, arr);
    }
  }
  return out;
}

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = createClient({ url, authToken });

  const perSlug = buildPerSlug();
  console.log(`[hotspots] ${perSlug.size} items have boxes`);

  let updated = 0;
  for (const [slug, hotspots] of perSlug) {
    const result = await client.execute({
      sql: `UPDATE products SET hotspot_boxes = ? WHERE slug = ?`,
      args: [JSON.stringify(hotspots), slug],
    });
    console.log(
      `  ${slug.padEnd(28)} → ${hotspots.length} hotspots, ${result.rowsAffected} row(s) updated`,
    );
    if (result.rowsAffected > 0) updated++;
  }

  console.log(`\n[hotspots] ${updated}/${perSlug.size} products updated`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
