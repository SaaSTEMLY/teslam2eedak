import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN!,
});

for (const t of [
  "locations",
  "tables",
  "modifier_groups",
  "products",
  "orders",
  "carts",
]) {
  try {
    const r = await client.execute(`SELECT COUNT(*) as n FROM "${t}"`);
    console.log(`${t}: ${r.rows[0]!.n} rows`);
  } catch (e) {
    console.log(`${t}: ERROR ${e instanceof Error ? e.message : e}`);
  }
}
