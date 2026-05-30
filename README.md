This is a [Next.js](https://nextjs.org) SaaS starter kit built with PayloadCMS, Better-Auth, Stripe, and PGlite.

## ⚡ Quick Start

### Prerequisites

- [Bun](https://bun.sh/) 1.0+
- Node.js 20+ (for Stripe CLI)
- [Docker](https://www.docker.com/) (for local PostgreSQL database)

### Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Copy the environment variables:

```bash
cp .env.example .env
```

3. Start the PostgreSQL database:

```bash
bun db:up
```

4. Add your Stripe keys to `.env` (get them from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)):

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. Start the development server:

```bash
bun dev:all
```

This will start:

- **Stripe Webhook Listener** — Local webhook forwarding
- **Next.js** — Dev server at http://localhost:3000

**Alternative commands:**

```bash
bun dev        # Next.js only
bun dev:env    # Stripe listener only
bun dev:all    # Next.js + Stripe listener
```

### First-Time Setup

After starting the dev server, visit http://localhost:3000/admin to:

1. Create your first admin user
2. Seed the database with sample data (click "Seed Database" button)

## 🗄️ Database

### Local Development

SQLite runs automatically — no setup required!

```bash
# Data stored in ./sqlite-data/saastarter.db
# Just run: bun dev

# To reset database:
bun db:clear   # Deletes sqlite-data directory
```

### Production

For production, you can use PostgreSQL, MySQL, or continue with SQLite.
Set `DATABASE_URL` in your environment:

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database

# Or stay with SQLite
DATABASE_URL=file:/path/to/production.db
```

**Note:** For high-traffic production apps, consider PostgreSQL or MySQL instead of SQLite.

- `src/app/(payload)` — PayloadCMS admin panel
- `src/app/(auth)` — Authentication pages
- `src/collections` — Database schema definitions
- `src/components` — React components
- `src/lib` — Utilities and configuration
- `src/messages` — i18n translations

## 🛠️ Available Scripts

```bash
bun dev              # Next.js dev server only
bun dev:env          # Stripe listener only
bun dev:all          # Next.js + Stripe listener
bun build            # Build for production
bun start            # Start production server
bun check            # TypeScript type checking
bun lint             # ESLint code linting
bun format           # Format code with Prettier
bun db:clear         # Clear SQLite database
bun payload:types    # Regenerate PayloadCMS types
```

### Debugging

Use the built-in VS Code debugger (F5) with these configurations:

- **Next.js: debug server-side** — Debug server components and API routes
- **Next.js: debug client-side** — Debug in Chrome browser
- **Next.js: debug full stack** — Debug both server and client
- **Dev: Services** — Run Stripe listener
- **Dev: All Services** — Run everything with debugging enabled

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [PayloadCMS Documentation](https://payloadcms.com/docs)
- [Better-Auth Documentation](https://better-auth.com)
- [Stripe Documentation](https://stripe.com/docs)
- [PGlite Documentation](https://pglite.dev)

## 🚀 Deploy

The easiest way to deploy is on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add a PostgreSQL database (Vercel Postgres, Neon, Supabase, etc.)
4. Set `DATABASE_URL` environment variable
5. Deploy!

Remember to update your Stripe webhook endpoint to your production URL.
