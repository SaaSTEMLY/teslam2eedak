# Image-first menu with hotspot overlay; structured list as fallback

The customer-facing menu primarily renders the restaurant's printed menu **image** with admin-drawn bounding-box hotspots; tapping a hotspot opens a structured item sheet for customization and add-to-cart. This is unusual — most ordering apps render cards from structured data only — but it preserves the brand-rich visual identity that makes a designed menu (e.g., Koffee Kulture's) recognizably itself, which is the strongest UX moat a café template can offer over generic alternatives. A **structured list view** ships alongside, accessible from a header toggle and always available, to cover accessibility (screen readers), search, SEO crawlers, locales without a translated menu image, and any restaurant onboarding before they've designed one.

## Considered Options

- **Structured cards only** — rejected: loses the brand vibe that made this template worth building for cafés.
- **Image-only with hotspots** — rejected: breaks accessibility, search, indexability, and any restaurant without a designed menu image.
- **Image as decorative hero, cards as primary** — rejected: doesn't deliver the "tap the printed menu" interaction the operator asked for.

## Consequences

- Menu items and hotspots are decoupled: an item can exist with no hotspot; a hotspot is a thin link record. The structured list keeps working when no image exists.
- Hotspot coordinates are stored normalized (0–1) so the same image can be re-uploaded at any resolution.
- Each locale needs its own menu image (the image is monolingual); per-locale hotspots inherit normalized coordinates and may be repositioned.
- Allergen filters cannot hide image pixels — non-matching hotspots are dimmed with a badge rather than removed.
- Authoring hotspots is a desktop interaction; mobile authoring is out of MVP scope.
