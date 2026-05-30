import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
const r = await c.execute("SELECT email FROM users LIMIT 5");
console.log(`${r.rows.length} users:`, r.rows.map(r => r.email));
