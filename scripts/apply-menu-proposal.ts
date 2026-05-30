/**
 * Apply the extracted-menu.proposal.json to the production DB.
 *
 * Strategy:
 * 1. Clear the existing 12 menu items (keep the saastarter demo product
 *    since it has variant data the SaaS-side checkout tests still use).
 * 2. For each proposal item, INSERT a new product row with:
 *      - slug, name (en), description (en), menuSection (en)
 *      - restaurantId, category, basePrice, allergens, isAvailable
 *      - hotspot_boxes JSON (en + ar locales pointing at same coords
 *        since the printed menu is monolingual today)
 *      - sizes sub-table rows when sizePrices present
 * 3. The product locale-tail (ar localization) is left for a follow-up
 *    pass — names/descriptions are LATIN brand-voice that read fine in
 *    AR contexts and the cart-side UX already falls back to en when ar
 *    isn't set.
 *
 *   CONFIRM=apply-menu bun scripts/apply-menu-proposal.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const PROPOSAL_PATH =
  "/home/mk/apps/teslam2eedak/scripts/extracted-menu.proposal.json";
const KEEP_SLUGS = new Set(["salted-karamel"]); // the saastarter demo

interface ProposalItem {
  slug: string;
  name: string;
  section: string;
  column: "left" | "right";
  basePriceQirsh: number;
  sizePrices?: ReadonlyArray<{ label: string; priceQirsh: number }>;
  description?: string;
  allergens?: ReadonlyArray<string>;
  isNew?: boolean;
  menuImageId: "menu1" | "menu2" | "menu3";
}

interface ProposalHotspot {
  slug: string;
  menuImageId: "menu1" | "menu2" | "menu3";
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: "high" | "medium" | "low";
}

interface Proposal {
  items: ProposalItem[];
  hotspots: ProposalHotspot[];
  summary: Record<string, unknown>;
}

async function main() {
  if (process.env.CONFIRM !== "apply-menu") {
    console.error(
      "Refusing to apply: set CONFIRM=apply-menu to opt in.\n" +
        "  e.g.  CONFIRM=apply-menu bun scripts/apply-menu-proposal.ts",
    );
    process.exit(2);
  }
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = createClient({ url, authToken });

  const proposal = JSON.parse(readFileSync(PROPOSAL_PATH, "utf8")) as Proposal;
  console.log(
    `[apply] proposal: ${proposal.items.length} items, ${proposal.hotspots.length} hotspots`,
  );

  // ── Clear existing menu products (keep saastarter demo) ──
  const existing = await client.execute(
    `SELECT id, slug FROM products WHERE _status = 'published'`,
  );
  const toDelete = (
    existing.rows as ReadonlyArray<{ id: number; slug: string }>
  ).filter((r) => !KEEP_SLUGS.has(r.slug));
  console.log(
    `[apply] clearing ${toDelete.length} existing products (keeping: ${[...KEEP_SLUGS].join(", ")})`,
  );
  for (const row of toDelete) {
    // Cascade-delete child rows first (Payload doesn't do FK cascades).
    for (const childTable of [
      "products_sizes_locales",
      "products_sizes",
      "products_allergens",
      "products_location_overrides",
      "products_pos_item_ids",
      "products_locales",
      "products_rels",
    ]) {
      try {
        const fk = childTable.endsWith("_locales") ||
                   childTable === "products_sizes" ||
                   childTable === "products_allergens" ||
                   childTable === "products_location_overrides" ||
                   childTable === "products_pos_item_ids"
          ? "_parent_id"
          : "parent_id";
        await client.execute({
          sql: `DELETE FROM "${childTable}" WHERE "${fk}" = ?`,
          args: [row.id],
        });
      } catch {
        // child table may not exist on this schema version
      }
    }
    await client.execute({
      sql: `DELETE FROM products WHERE id = ?`,
      args: [row.id],
    });
  }

  // ── Build a hotspot map for join ──
  const hotspotsBySlug = new Map<string, ProposalHotspot>();
  for (const h of proposal.hotspots) hotspotsBySlug.set(h.slug, h);

  // ── Insert each new item ──
  let inserted = 0;
  let withHotspots = 0;
  const nowIso = new Date().toISOString();

  for (const item of proposal.items) {
    const hotspot = hotspotsBySlug.get(item.slug);
    const hotspotBoxes = hotspot
      ? JSON.stringify([
          {
            locale: "en",
            menuImageId: hotspot.menuImageId,
            x: Number(hotspot.x.toFixed(4)),
            y: Number(hotspot.y.toFixed(4)),
            w: Number(hotspot.w.toFixed(4)),
            h: Number(hotspot.h.toFixed(4)),
          },
          {
            locale: "ar",
            menuImageId: hotspot.menuImageId,
            x: Number(hotspot.x.toFixed(4)),
            y: Number(hotspot.y.toFixed(4)),
            w: Number(hotspot.w.toFixed(4)),
            h: Number(hotspot.h.toFixed(4)),
          },
        ])
      : null;

    const insert = await client.execute({
      sql: `
        INSERT INTO products (
          slug, category, featured, restaurant_id,
          prep_time_minutes, is_available, hotspot_boxes,
          inventory, enable_variants, price_in_u_s_d_enabled, price_in_u_s_d,
          _status, updated_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        item.slug,
        "software", // category enum — KK doesn't use this; default keeps payload happy
        item.isNew ? 1 : 0, // featured = NEW
        "kk-main",
        3, // prep minutes default
        1, // is_available
        hotspotBoxes,
        9999, // inventory
        0, // enable_variants (we use sizes sub-rows instead)
        1, // priceInUSDEnabled
        item.basePriceQirsh,
        "published",
        nowIso,
        nowIso,
      ],
    });
    const productId = Number(insert.lastInsertRowid);

    // Insert en locale (name + description + menuSection)
    await client.execute({
      sql: `
        INSERT INTO products_locales (
          _parent_id, _locale, name, description, menu_section
        ) VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        productId,
        "en",
        item.name,
        item.description ?? "",
        item.section,
      ],
    });

    // Insert sizes if present. products_sizes.id is TEXT PRIMARY KEY
    // (not auto-rowid), so we generate UUIDs explicitly. The matching
    // products_sizes_locales._parent_id is also TEXT, FK back to the
    // sizes UUID.
    if (item.sizePrices) {
      let sizeOrder = 0;
      for (const size of item.sizePrices) {
        const sizeId = crypto.randomUUID();
        await client.execute({
          sql: `
            INSERT INTO products_sizes (
              id, _parent_id, _order, value, price_in_u_s_d, is_default
            ) VALUES (?, ?, ?, ?, ?, ?)
          `,
          args: [
            sizeId,
            productId,
            sizeOrder++,
            size.label.toLowerCase(),
            size.priceQirsh,
            sizeOrder === 1 ? 1 : 0,
          ],
        });
        await client.execute({
          sql: `
            INSERT INTO products_sizes_locales (
              _parent_id, _locale, label
            ) VALUES (?, ?, ?)
          `,
          args: [sizeId, "en", size.label],
        });
      }
    }

    // Insert allergens if present
    if (item.allergens && item.allergens.length > 0) {
      let allergenOrder = 0;
      for (const allergen of item.allergens) {
        await client.execute({
          sql: `
            INSERT INTO products_allergens (
              parent_id, "order", value
            ) VALUES (?, ?, ?)
          `,
          args: [productId, allergenOrder++, allergen],
        });
      }
    }

    inserted++;
    if (hotspot) withHotspots++;
    if (inserted % 20 === 0) {
      console.log(`  ${inserted}/${proposal.items.length} items inserted...`);
    }
  }

  console.log(
    `\n[apply] ✓ inserted ${inserted} items, ${withHotspots} with hotspots`,
  );

  // ── Final verification ──
  const finalCount = await client.execute(
    `SELECT COUNT(*) as n FROM products WHERE _status = 'published'`,
  );
  const hotspotCount = await client.execute(
    `SELECT COUNT(*) as n FROM products WHERE hotspot_boxes IS NOT NULL`,
  );
  console.log(
    `[apply] DB now has ${finalCount.rows[0]!.n} published products, ${hotspotCount.rows[0]!.n} with hotspots`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
