import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
for (const t of ["products_sizes", "products_allergens", "products_locales", "products_sizes_locales"]) {
  const r = await c.execute(`SELECT sql FROM sqlite_master WHERE name = '${t}'`);
  console.log(`--- ${t} ---`);
  console.log(r.rows[0]?.sql);
}
