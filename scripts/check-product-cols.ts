import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
const r = await c.execute("PRAGMA table_info(products)");
for (const row of r.rows) console.log(`  ${row.name} ${row.type}`);
