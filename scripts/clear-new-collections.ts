import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
// Wipe new collections so the seed can re-create them.
for (const t of [
  "tables", // child must go first
  "locations",
  "modifier_groups_options_locales",
  "modifier_groups_options_allergens",
  "modifier_groups_options",
  "modifier_groups_locales",
  "modifier_groups",
  "products_sizes_locales",
  "products_sizes",
  "products_allergens",
  "products_location_overrides",
  "products_pos_item_ids",
  "products_locales",
  "products_rels",
  "products",
  "variants_locales",
  "variants_rels",
  "variants",
  "variant_options",
  "variant_types",
  "media",
  "faqs_locales",
  "faqs",
  "blogs_locales",
  "blogs",
]) {
  try {
    const r = await c.execute(`DELETE FROM "${t}"`);
    console.log(`${t}: cleared ${r.rowsAffected} rows`);
  } catch (e) {
    console.log(`${t}: skip (${e instanceof Error ? e.message.slice(0,60) : ""})`);
  }
}
