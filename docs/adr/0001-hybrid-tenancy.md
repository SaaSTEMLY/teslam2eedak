# Hybrid tenancy: single-tenant deployment now, multi-tenant-capable schema

teslam2eedak ships as a **fork-and-rebrand template** — each restaurant gets its own fork, deployment, and Payload database. We chose this over a multi-tenant SaaS because the substrate (saastarter-next16) is single-tenant, the first known launch is one restaurant (Koffee Kulture), and self-serve onboarding isn't a near-term goal. To avoid a painful migration later, every restaurant-scoped collection reserves a `restaurantId` column and treats it as a constant in single-tenant deployments — making the future shift to multi-tenant a routing/auth concern rather than a schema change.

## Considered Options

- **Multi-tenant from day 1** — rejected: significant engineering for tenant isolation, billing-per-tenant, subdomain routing, and plan tiers with no validated demand.
- **Pure single-tenant, ignore future multi-tenancy** — rejected: a single column reservation today is essentially free; retrofitting `restaurantId` foreign keys across orders, tables, menu items, and modifier groups after data exists is not.

## Consequences

- Every restaurant-scoped collection must carry `restaurantId` from its first migration, even though it's currently unused for filtering.
- Authentication and authorization are scoped per-deployment; we do not (yet) need cross-tenant access controls.
- Any feature that would assume "one restaurant per Better-Auth tenant" must remain compatible with both worlds.
