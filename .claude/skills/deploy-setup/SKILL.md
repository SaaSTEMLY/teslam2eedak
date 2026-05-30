---
name: deploy-setup
description: "Two-phase deployment setup — Phase A (post-clone, all template services) and Phase B (post-rebrand, new integrations)."
---

# Deploy Setup

Deployment setup for a saastarter-based project. This skill runs in two phases:

| Argument         | Behavior                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| _(empty)_ or `a` | **Phase A** — Post-clone setup: all services the template ships with (DB, Vercel, Stripe, Resend, SaaSignal, OAuth, Blob) |
| `b`              | **Phase B** — Post-rebrand setup: new integrations added during rebrand (e.g. Notion, Google Maps, CRM, custom analytics) |
| `all`            | Run both phases sequentially                                                                                              |

$ARGUMENTS can also include the project name and Vercel team (e.g. `a myapp shabab-ray2a`). If not provided, ask the user.

**Typical workflow:**

1. Clone the template
2. Run `/deploy-setup` (Phase A) — set up all built-in services, deploy, seed
3. Run `/rebrand` — customize branding, content, products, add new integrations
4. Run `/deploy-setup b` — set up env vars and credentials for any new services added during rebrand

---

# Phase A — Template Services

Set up all services the saastarter template ships with out of the box.

## Prerequisites

Ensure these CLIs are installed and authenticated:

```bash
# Turso (database)
# On Linux/macOS:
curl -sSfL https://get.tur.so/install.sh | bash
turso auth login
# On Windows (Git Bash/MSYS2): the install script doesn't support Windows.
# Install via WSL: wsl -e bash -c "curl -sSfL https://get.tur.so/install.sh | bash"
# Then use: wsl -e bash -lc "export PATH=\$HOME/.turso:\$PATH && turso <command>"
# For headless auth: turso auth login --headless
# Or set token directly: turso config set token "YOUR_TOKEN"

# Vercel
bun add -g vercel
vercel login

# Resend (optional — email CLI)
bun add -g resend
resend login
```

> **Windows/WSL Note:** When running from Git Bash on Windows accessing WSL paths (`//wsl.localhost/...`), the Windows bun binary cannot properly run postinstall scripts for native modules. Run `bun install` from **inside WSL** (`wsl -e bash -lc "cd ~/apps/PROJECT && bun install"`) for reliable installs. The Windows `vercel` CLI works fine over WSL paths.

---

## Environment Variable Strategy

The local `.env` uses **production service credentials** (DB, email, blob, analytics) so you can develop and test against real data. Only URL-based variables stay dev-appropriate.

| Variable                             | Local `.env`            | Vercel Production                  |
| ------------------------------------ | ----------------------- | ---------------------------------- |
| `NEXT_PUBLIC_BETTER_AUTH_URL`        | `http://localhost:3000` | `https://PROJECT.vercel.app`       |
| `DATABASE_URL`                       | `libsql://...` (Turso)  | Same                               |
| `DATABASE_AUTH_TOKEN`                | Turso token             | Same                               |
| `PAYLOAD_SECRET`                     | Generated hex           | Same                               |
| `BETTER_AUTH_SECRET`                 | Generated hex           | Same                               |
| `RESEND_API_KEY`                     | Optional (console log)  | Production key (required)          |
| `RESEND_AUDIENCE_ID`                 | Production ID           | Same                               |
| `SAASIGNAL_TOKEN`                    | Production token        | Same                               |
| `BLOB_READ_WRITE_TOKEN`              | Production token        | Same                               |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...`           | `pk_test_...` (or `pk_live_...`)   |
| `STRIPE_SECRET_KEY`                  | `sk_test_...`           | `sk_test_...` (or `sk_live_...`)   |
| `STRIPE_WEBHOOK_SECRET`              | Local webhook secret    | Production webhook secret          |
| `GOOGLE_CLIENT_ID`                   | Production ID           | Same                               |
| `GOOGLE_CLIENT_SECRET`               | Production secret       | Same                               |
| `PAYLOAD_SCHEMA_PUSH`                | `true` (first run)      | `true` (first deploy, then remove) |

---

## Step 0: Initialize Local .env

```bash
cp .env.example .env
```

### Generate secrets and write to .env

```bash
PAYLOAD_SECRET=$(openssl rand -hex 32)
BETTER_AUTH_SECRET=$(openssl rand -hex 32)

sed -i "s|^PAYLOAD_SECRET=.*|PAYLOAD_SECRET=$PAYLOAD_SECRET|" .env
sed -i "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET|" .env
```

Verify `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000` is set (default from `.env.example`).

---

## Step 1: Create Turso Database

```bash
turso db create PROJECT_NAME
TURSO_URL=$(turso db show PROJECT_NAME --url)
TURSO_TOKEN=$(turso db tokens create PROJECT_NAME)
```

### Write to .env immediately

```bash
sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$TURSO_URL|" .env

# Add or update DATABASE_AUTH_TOKEN
grep -q '^DATABASE_AUTH_TOKEN=' .env \
  && sed -i "s|^DATABASE_AUTH_TOKEN=.*|DATABASE_AUTH_TOKEN=$TURSO_TOKEN|" .env \
  || echo "DATABASE_AUTH_TOKEN=$TURSO_TOKEN" >> .env
```

---

## Step 2: Create SaaSignal Token

From [SaaSignal dashboard](https://saasignal.com) or via MCP:

1. Create an organization (e.g., `PROJECT_NAME`)
2. Create a project under it (e.g., `production`)
3. Create a token with `*` scope, scoped to the project
4. Save the `sk_live_...` token

### Write to .env immediately

```bash
# Add or update SAASIGNAL_TOKEN
grep -q '^SAASIGNAL_TOKEN=' .env \
  && sed -i "s|^SAASIGNAL_TOKEN=.*|SAASIGNAL_TOKEN=$SAASIGNAL_TOKEN_VALUE|" .env \
  || echo "SAASIGNAL_TOKEN=$SAASIGNAL_TOKEN_VALUE" >> .env
```

---

## Step 3: Create Resend API Key

> **Local dev note:** `RESEND_API_KEY` is **optional** for local development and testing. When not set (or in non-production environments), emails are logged to the console instead of being sent via Resend. You can skip this step during initial setup and add it later when you need real email delivery.

From [Resend dashboard](https://resend.com):

1. **API Keys** → create key named `PROJECT_NAME` (full access) → save `re_...` token (shown only once)
2. **Audiences** → copy audience ID (UUID)

### Write to .env immediately

```bash
sed -i "s|^RESEND_API_KEY=.*|RESEND_API_KEY=$RESEND_KEY|" .env

# Optional: audience ID
grep -q '^RESEND_AUDIENCE_ID=' .env \
  && sed -i "s|^RESEND_AUDIENCE_ID=.*|RESEND_AUDIENCE_ID=$AUDIENCE_ID|" .env \
  || echo "RESEND_AUDIENCE_ID=$AUDIENCE_ID" >> .env
```

---

## Step 4: Set Up Vercel

```bash
# Switch to team (if applicable)
vercel switch TEAM_NAME

# Link the project
cd /path/to/project
vercel link --yes

# Create Blob Storage (requires interactive terminal)
vercel blob create-store PROJECT_NAME
# Answer "Y" when asked to link to the project
# Select all environments (Production, Preview, Development)
```

> **Agent Note:** The `vercel blob create-store` command requires interactive terminal input to select environments for linking. If running non-interactively (e.g., from an agent), the blob store will be created but not linked. In that case, link it manually via the Vercel dashboard (Storage → Connect Store), or skip blob storage and add it later — media uploads will fall back to local storage in dev and the build warning about storage adapters is harmless.

```bash
# Pull blob token and write to .env
vercel env pull .env.vercel
BLOB_TOKEN=$(grep '^BLOB_READ_WRITE_TOKEN=' .env.vercel | cut -d'=' -f2-)

grep -q '^BLOB_READ_WRITE_TOKEN=' .env \
  && sed -i "s|^BLOB_READ_WRITE_TOKEN=.*|BLOB_READ_WRITE_TOKEN=$BLOB_TOKEN|" .env \
  || echo "BLOB_READ_WRITE_TOKEN=$BLOB_TOKEN" >> .env

rm .env.vercel
```

---

## Step 5: Stripe Keys

Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys). Use **test keys** for local dev.

### Write to .env

```bash
sed -i "s|^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.*|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PK|" .env
sed -i "s|^STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SK|" .env
sed -i "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$STRIPE_WH|" .env
```

---

## Step 6: Google OAuth (Optional)

From [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

> **Important:** When reusing OAuth credentials from another project, you must add the new domain's redirect URI to Google Cloud Console:
> `https://YOUR-DOMAIN/api/auth/callback/google`
> Without this, Google sign-in will fail with a redirect_uri_mismatch error.

### Write to .env

```bash
sed -i "s|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=$GOOGLE_ID|" .env
sed -i "s|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=$GOOGLE_SECRET|" .env
```

---

## Step 7: Push Environment Variables to Vercel

All production service credentials are already in `.env`. Push them to Vercel with environment-specific overrides.

### Variable reference

| Variable                             | Source  | Notes                          |
| ------------------------------------ | ------- | ------------------------------ |
| `PAYLOAD_SECRET`                     | Step 0  | 64-char hex, unique per deploy |
| `BETTER_AUTH_SECRET`                 | Step 0  | 64-char hex, unique per deploy |
| `NEXT_PUBLIC_BETTER_AUTH_URL`        | Per-env | Different per environment      |
| `DATABASE_URL`                       | Step 1  | `libsql://...`                 |
| `DATABASE_AUTH_TOKEN`                | Step 1  | Turso token                    |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Step 5  | `pk_test_...` or `pk_live_...` |
| `STRIPE_SECRET_KEY`                  | Step 5  | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET`              | Step 5  | `whsec_...`                    |
| `RESEND_API_KEY`                     | Step 3  | `re_...`                       |
| `RESEND_AUDIENCE_ID`                 | Step 3  | UUID (optional)                |
| `SAASIGNAL_TOKEN`                    | Step 2  | `sk_live_...`                  |
| `GOOGLE_CLIENT_ID`                   | Step 6  | Optional                       |
| `GOOGLE_CLIENT_SECRET`               | Step 6  | Optional                       |
| `BLOB_READ_WRITE_TOKEN`              | Step 4  | Auto-set if store is linked    |
| `PAYLOAD_SCHEMA_PUSH`                | `true`  | First deploy only, then remove |

### Push URL per-environment

**Gotcha:** Use `printf '%s'` instead of `echo` to avoid trailing newlines that corrupt URLs.

```bash
# NEXT_PUBLIC_BETTER_AUTH_URL differs per environment
printf '%s' 'https://PROJECT.vercel.app' | vercel env add NEXT_PUBLIC_BETTER_AUTH_URL production
printf '%s' 'http://localhost:3000' | vercel env add NEXT_PUBLIC_BETTER_AUTH_URL development
```

### Bulk push shared variables from .env

These variables share the same value across local, Vercel production, and Vercel development:

```bash
ENVS=("production" "development")
VARS=(
  "PAYLOAD_SECRET" "BETTER_AUTH_SECRET"
  "DATABASE_URL" "DATABASE_AUTH_TOKEN"
  "RESEND_API_KEY" "RESEND_AUDIENCE_ID"
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "STRIPE_SECRET_KEY" "STRIPE_WEBHOOK_SECRET"
  "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET"
  "BLOB_READ_WRITE_TOKEN"
  "PAYLOAD_SCHEMA_PUSH" "SAASIGNAL_TOKEN"
)
for var in "${VARS[@]}"; do
  value=$(grep "^${var}=" .env | head -1 | cut -d'=' -f2- | tr -d '"')
  if [ -n "$value" ]; then
    for env in "${ENVS[@]}"; do
      printf '%s' "$value" | vercel env add "$var" "$env" 2>&1
    done
  fi
done
```

> **Note:** If you want different Stripe keys for production (live keys), push those separately:
>
> ```bash
> printf '%s' 'pk_live_...' | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
> printf '%s' 'sk_live_...' | vercel env add STRIPE_SECRET_KEY production
> printf '%s' 'whsec_...' | vercel env add STRIPE_WEBHOOK_SECRET production
> ```

---

## Step 8: Deploy

```bash
vercel deploy --prod
```

### Expected build warnings (harmless)

- **Email sending** — In production, emails sent via Resend. In dev, emails are logged to console (no `RESEND_API_KEY` needed)
- **`generateStaticParams` failures** — Empty DB causes graceful failures; pages render dynamically
- **Storage adapter warning** — `Collections with uploads enabled require a storage adapter` — appears if `BLOB_READ_WRITE_TOKEN` is not set; media uploads fall back to local storage
- **Payload version mismatch** — If you see `Mismatching "payload" dependency versions`, ensure ALL `@payloadcms/*` packages in `package.json` use the same version (e.g., all `^3.75.0`). The `@payloadcms/email-resend` package may drift — pin it to match.

---

## Step 9: Post-Deploy — Schema Push, Admin Setup, and Seed

### CRITICAL: Trigger Schema Push

**The first `vercel deploy --prod` only builds the app — it does NOT push the database schema.**

Payload CMS pushes the schema lazily on the first request that initializes Payload (any `/api/*` route). On Vercel serverless, this can silently fail or timeout if the cold start + schema push exceeds the function timeout.

**Recommended approach — push schema from local dev server:**

```bash
# Run the dev server pointed at the remote Turso DB
PAYLOAD_SCHEMA_PUSH=true bun dev

# In another terminal, trigger Payload initialization:
curl http://localhost:3000/api/users
# Wait for the "Pulling schema from database..." log to complete
```

**Verify tables were created:**

```bash
turso db shell PROJECT_NAME '.tables'
# Should list ~50 tables (users, products, blogs, orders, etc.)
```

> **Why not push from Vercel?** The schema push uses drizzle-kit's `push` which runs during Payload initialization. On Vercel, serverless functions have a 60s timeout and cold starts can be slow. The push may silently fail. Running locally is more reliable because you can see the drizzle output and there's no timeout.

### Create First Admin Account

After schema push, visit `/admin` on your production domain. The `payload-auth` plugin will:

1. Detect zero admin users
2. Auto-create an admin invitation token
3. Redirect to `/admin/signup?token=...`

Fill in the signup form to create the first admin user. This is a **required manual step** — the seed endpoint requires authentication.

### Seed the database

The seed endpoint is a **POST** request that requires an authenticated user session:

```bash
# Option A: Visit in browser while logged in as admin
# Navigate to: https://your-domain.vercel.app/next/seed
# (The browser sends the auth cookie automatically)

# Option B: Use the /seed skill
# /seed
```

> **Note:** The seed endpoint at `/next/seed` requires a POST request with valid auth cookies. A simple GET or unauthenticated POST returns 403. You must be signed in.

### Remove PAYLOAD_SCHEMA_PUSH

After confirming the schema was pushed (tables exist in Turso), remove `PAYLOAD_SCHEMA_PUSH` from both `.env` and Vercel:

```bash
sed -i '/^PAYLOAD_SCHEMA_PUSH=/d' .env
vercel env rm PAYLOAD_SCHEMA_PUSH production -y
vercel env rm PAYLOAD_SCHEMA_PUSH development -y
```

### Verify local setup

```bash
bun dev          # Start Next.js only
bun dev:all      # Start Next.js + Stripe listener
```

Visit `http://localhost:3000` — you should see production data from Turso.

### Verification checklist

- [ ] Homepage loads (local dev with production DB)
- [ ] `/admin` panel accessible
- [ ] `/auth/sign-in` works
- [ ] `/products` lists seeded products
- [ ] `/blogs` lists seeded posts
- [ ] Dark mode works
- [ ] Language switching works (en/ar/es)
- [ ] Stripe checkout flow works (test mode)
- [ ] `/api/docs` — Scalar API docs load with correct brand name
- [ ] `/api/openapi.json` — returns valid OpenAPI 3.1 spec
- [ ] `/llms.txt` — returns LLM-friendly API reference
- [ ] `/to-humans.md` — returns Markdown API reference
- [ ] `/account/developer` — API key creation works (requires signed-in user)
- [ ] Production site loads at Vercel URL

---

# Phase B — Post-Rebrand Integrations

After running `/rebrand`, you may have added new features that require additional services. This phase helps set up those new integrations.

## Step 1: Inventory New Services

Scan the codebase for new environment variables that aren't in `.env`:

```bash
# Find all env var references in src/
grep -roh 'process\.env\.\w\+' src/ | sort -u | sed 's/process\.env\.//' > /tmp/env-used.txt

# Compare with what's in .env
grep -oP '^\w+(?==)' .env | sort -u > /tmp/env-set.txt

# Show what's missing
comm -23 /tmp/env-used.txt /tmp/env-set.txt
```

For each missing variable, follow the steps below.

## Step 2: Configure Each New Service

For each new integration added during rebrand:

1. **Create the account/credentials** on the service's dashboard
2. **Add the env var** to `.env` locally
3. **Add to `.env.example`** with a placeholder and comment explaining what it's for
4. **Update `src/lib/env-validation.ts`** — add the new var to the validation schema with appropriate constraints
5. **Push to Vercel** for both environments:

```bash
printf '%s' 'VALUE' | vercel env add NEW_VAR_NAME production
printf '%s' 'VALUE' | vercel env add NEW_VAR_NAME development
```

## Step 3: Common Post-Rebrand Integrations

These are services frequently added during rebranding. Not all will apply — only set up what your rebrand introduced.

| Integration         | Env Vars                                                         | Setup                                                                                 |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Google Maps         | `NEXT_PUBLIC_GOOGLE_MAPS_KEY`                                    | [Google Cloud Console](https://console.cloud.google.com) → APIs → Maps JavaScript API |
| Notion              | `NOTION_API_KEY`, `NOTION_DATABASE_ID`                           | [Notion Integrations](https://www.notion.so/my-integrations) → create integration     |
| Twilio (SMS)        | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` | [Twilio Console](https://www.twilio.com/console)                                      |
| OpenAI              | `OPENAI_API_KEY`                                                 | [OpenAI Platform](https://platform.openai.com/api-keys)                               |
| Anthropic           | `ANTHROPIC_API_KEY`                                              | [Anthropic Console](https://console.anthropic.com)                                    |
| Custom analytics    | Varies                                                           | Add the script/SDK and any required API keys                                          |
| CRM (HubSpot, etc.) | `HUBSPOT_API_KEY`                                                | Service-specific dashboard                                                            |

## Step 4: Redeploy and Verify

```bash
# Redeploy with new env vars
vercel deploy --prod

# Run tests to verify nothing broke
bun run test
```

### Verification checklist

- [ ] All new env vars are in `.env`, `.env.example`, and Vercel
- [ ] `src/lib/env-validation.ts` validates the new vars
- [ ] New integration features work locally (`bun dev`)
- [ ] New integration features work in production
- [ ] `/api/docs` reflects any new API routes added for the integration
- [ ] Tests pass (`bun run test`)
