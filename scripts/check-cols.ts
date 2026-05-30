import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
for (const t of ["products_sizes", "products_allergens", "products_locales", "products_sizes_locales"]) {
  console.log(`--- ${t} ---`);
  const r = await c.execute(`PRAGMA table_info("${t}")`);
  for (const row of r.rows) console.log(`  ${row.name.toString().padEnd(24)} ${row.type} notnull=${row.notnull} default=${row.dflt_value}`);
}
