import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
for (const t of ["products", "products_sizes", "products_allergens", "products_locales"]) {
  const r = await c.execute(`SELECT COUNT(*) as n FROM "${t}"`);
  console.log(`${t}: ${r.rows[0]!.n}`);
}
