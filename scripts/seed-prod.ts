/**
 * Run the seed function against whichever DB is in DATABASE_URL.
 * Bypasses the HTTP /next/seed auth gate; uses the local API with the
 * Payload root user privileges.
 *
 * Requires: DATABASE_URL + DATABASE_AUTH_TOKEN. Idempotent — the seed
 * function clears each collection before re-seeding.
 *
 *   bun scripts/seed-prod.ts
 *
 * The CONFIRM=seed-prod env guard is here because this WIPES the
 * carts/orders/products/locations/tables/modifier-groups/blogs/faqs
 * collections before re-creating them. Production data outside those
 * collections is untouched, but anything inside them is gone.
 */
import { createLocalReq, getPayload } from "payload";
import config from "../src/payload.config";
import { seed } from "../src/endpoints/seed";

async function main() {
  if (process.env.CONFIRM !== "seed-prod") {
    console.error(
      "Refusing to run: set CONFIRM=seed-prod to opt in. This WIPES" +
        " menu items, carts, orders, locations, tables, modifier groups," +
        " blogs and FAQs in the target DB before re-seeding.",
    );
    process.exit(2);
  }

  const dbUrl = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set; refusing to seed nothing.");
    process.exit(2);
  }
  const masked = dbUrl.replace(/:[^@/]+@/, ":***@");
  console.log(`[seed-prod] target: ${masked}`);

  const payload = await getPayload({ config });

  // Find any user to use as the request actor. The seed function calls
  // payload.create() with overrideAccess implicitly via the local API,
  // so the user only matters for audit-trail and beforeChange hooks.
  const { docs: users } = await payload.find({
    collection: "users",
    limit: 1,
    overrideAccess: true,
  });
  const actor = users[0];
  if (!actor) {
    console.error(
      "No users in the DB. Sign up at /auth/sign-up first, then re-run.",
    );
    process.exit(2);
  }
  console.log(`[seed-prod] actor: ${(actor as { email?: string }).email}`);

  const req = await createLocalReq(
    { user: actor as Parameters<typeof createLocalReq>[0]["user"] },
    payload,
  );

  const start = Date.now();
  await seed({ payload, req });
  console.log(
    `[seed-prod] done in ${Math.round((Date.now() - start) / 100) / 10}s`,
  );
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error("[seed-prod] failed:", err);
    process.exit(1);
  },
);
