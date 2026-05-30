/**
 * Drop indexes whose names collide between an in-prod state and what
 * drizzle-kit push wants to recreate. Run this BEFORE retrying push
 * if it fails with "index ... already exists".
 *
 * Skips anything except indexes the push is trying to recreate, so
 * it's safe to re-run.
 *
 *   bun scripts/clear-conflicting-indexes.ts
 */
import { createClient } from "@libsql/client";

const KNOWN_CONFLICTS = [
  "blogs_slug_idx",
  "blogs_status_idx",
  "blogs_updated_at_idx",
  "blogs_published_at_idx",
  "blogs_created_at_idx",
  "blogs_locales_locale_parent_id_unique",
];

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = createClient({ url, authToken });

  for (const idx of KNOWN_CONFLICTS) {
    try {
      await client.execute(`DROP INDEX IF EXISTS "${idx}"`);
      console.log(`dropped ${idx}`);
    } catch (e) {
      console.log(
        `skip ${idx}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
