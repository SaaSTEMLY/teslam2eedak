import { createClient } from "@libsql/client";
const c = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_AUTH_TOKEN! });
const r = await c.execute("SELECT slug, hotspot_boxes FROM products ORDER BY slug");
for (const row of r.rows) {
  const boxes = row.hotspot_boxes as string | null;
  const n = boxes ? (JSON.parse(boxes) as unknown[]).length : 0;
  console.log(`${String(row.slug).padEnd(36)} ${n} hotspot(s)`);
}
