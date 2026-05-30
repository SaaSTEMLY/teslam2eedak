import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });

const counts = await c.execute(`
  SELECT
    (SELECT COUNT(*) FROM products WHERE _status='published') as products,
    (SELECT COUNT(*) FROM products WHERE hotspot_boxes IS NOT NULL) as with_hotspots,
    (SELECT COUNT(*) FROM products_locales WHERE _locale='en') as en_locales,
    (SELECT COUNT(*) FROM products_sizes) as size_rows,
    (SELECT COUNT(*) FROM products_allergens) as allergen_rows
`);
console.log(counts.rows[0]);

const sample = await c.execute(`
  SELECT p.slug, pl.name, pl.menu_section, p.price_in_u_s_d as price,
         (SELECT COUNT(*) FROM products_sizes WHERE _parent_id = p.id) as size_count,
         CASE WHEN p.hotspot_boxes IS NULL THEN 'no' ELSE 'yes' END as has_hotspot
  FROM products p
  LEFT JOIN products_locales pl ON pl._parent_id = p.id AND pl._locale = 'en'
  WHERE p._status = 'published'
  ORDER BY p.created_at DESC
  LIMIT 8
`);
console.log("\nLast 8 inserted:");
for (const r of sample.rows) console.log(`  ${String(r.slug).padEnd(30)} ${String(r.name).padEnd(28)} ${r.price} qirsh, ${r.size_count} sizes, hotspot=${r.has_hotspot}`);
