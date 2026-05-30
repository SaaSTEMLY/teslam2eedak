/**
 * One-shot: push the current Payload schema to whichever DB the
 * configured DATABASE_URL points to.
 *
 *   PAYLOAD_SCHEMA_PUSH=true bun scripts/push-schema.ts
 *
 * Reads .env automatically (Bun convention). Pushing to a remote
 * Turso DB requires DATABASE_URL + DATABASE_AUTH_TOKEN to be set.
 *
 * Safe to re-run — drizzle-kit push is additive; pre-existing tables
 * and columns are left alone. For destructive deltas (column renames
 * or drops) the underlying drizzle-kit call would prompt
 * interactively; in this codebase to date every schema change has
 * been additive.
 */

import { getPayload } from "payload";
import config from "../src/payload.config";

async function main() {
  if (process.env.PAYLOAD_SCHEMA_PUSH !== "true") {
    console.error(
      "Refusing to push: set PAYLOAD_SCHEMA_PUSH=true to opt in.",
    );
    process.exit(2);
  }

  const dbUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set; refusing to push to nothing.");
    process.exit(2);
  }

  // Mask the URL for safety in logs.
  const masked = dbUrl.replace(/:[^@/]+@/, ":***@");
  console.log(`[push-schema] target: ${masked}`);
  console.log(
    `[push-schema] auth token present: ${
      process.env.DATABASE_AUTH_TOKEN ? "yes" : "no"
    }`,
  );

  const start = Date.now();
  await getPayload({ config });
  console.log(
    `[push-schema] done in ${Math.round((Date.now() - start) / 100) / 10}s`,
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("[push-schema] failed:", err);
    process.exit(1);
  },
);
