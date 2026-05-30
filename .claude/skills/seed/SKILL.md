---
name: seed
description: "Seed the database with sample data — products, blogs, FAQs. Supports seeding specific collections."
---

# Seed

Seed the database with sample data. $ARGUMENTS specifies which collections (e.g. `products`, `blogs`, `all`). Default: seed all.

## Steps

1. **Ensure the app is running**: Check if dev server is on port 3000. If not, start with `bun dev` in the background.

2. **Wait for readiness**: Poll `http://localhost:3000/api/health` or `http://localhost:3000/admin` until ready.

3. **Trigger the seed endpoint**:

   ```
   curl -X POST http://localhost:3000/api/seed
   ```

   If the endpoint doesn't exist, check `src/endpoints/seed/` for seed data and run programmatically.

4. **Verify**: Query the Payload REST API:
   - `GET /api/products` — seeded products
   - `GET /api/blogs` — seeded blog posts
   - `GET /api/faqs` — seeded FAQs

5. **Report**: List what was seeded and how many items per collection.

## Rules

- If the database already has data, warn before overwriting
- If specific collections requested via $ARGUMENTS, only seed those
- Seed data files are in `src/endpoints/seed/`
