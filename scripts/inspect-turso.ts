/**
 * Inspect the live Turso DB: list existing tables + indexes that
 * collide with the payload schema push.
 *
 *   bun scripts/inspect-turso.ts
 */
import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = createClient({ url, authToken });

  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  );
  console.log("─── Tables (" + tables.rows.length + ") ───");
  for (const row of tables.rows) {
    console.log("  " + row.name);
  }

  const indexes = await client.execute(
    "SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY tbl_name, name",
  );
  console.log("\n─── Indexes (" + indexes.rows.length + ") ───");
  for (const row of indexes.rows) {
    console.log("  " + row.tbl_name + "." + row.name);
  }

  // Check the three new collections specifically
  console.log("\n─── New collections expected by code ───");
  for (const t of ["locations", "tables", "modifier_groups"]) {
    const present = tables.rows.some((r) => r.name === t);
    console.log("  " + t + ": " + (present ? "EXISTS" : "MISSING"));
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
