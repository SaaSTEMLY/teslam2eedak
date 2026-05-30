# Multi-branch from one deployment, with a shared menu and per-branch overrides

One restaurant deployment hosts many **branches** (locations), each with its own tables, opening hours, staff Live Orders Board, and per-item availability/price overrides. The menu is authored at the restaurant level by default and inherited by every branch. We picked this over the simpler one-deployment-per-branch model because Koffee Kulture is multi-branch in reality (Maadi, Heliopolis, Zamalek, …) and the per-fork maintenance overhead — synchronizing menu updates by hand, fragmenting customer data, duplicating Stripe configuration — compounds badly past two branches. The schema cost is one extra `locationId` foreign key on tables, orders, and per-branch menu-item override records.

## Considered Options

- **One deployment = one branch** — rejected: doesn't match how multi-branch restaurants think; KK would maintain N forks.
- **Multi-branch later: ship single-branch admin UX now, add `locationId` schema now** — folded into this decision. The schema is multi-branch from day 1; the admin UX for managing many branches is light in MVP but not absent (you can create a second branch and override prices on it). What's deferred is rich cross-branch reporting / aggregate dashboards.

## Consequences

- Carts and orders are scoped to a branch, not just to a restaurant. The QR landing parameter determines the branch.
- Menu items have a single authoritative record at the restaurant level; branches store sparse overrides (price, availability, prep-time) referencing the parent item.
- Tax/service-charge rates default to the restaurant and may be overridden per branch — required because some restaurants run different rates in different governorates or in airport locations.
- The Live Orders Board is scoped per branch; a manager covering multiple branches sees one board per branch (no cross-branch aggregated view in MVP).
- "Restaurant closed" vs "branch closed" are distinct states; a closed branch refuses new orders but the rest of the restaurant keeps working.
