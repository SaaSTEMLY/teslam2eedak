/**
 * Pure helpers for the AI ordering assistant.
 *
 * The assistant takes a free-text guest query ("I want a strong sweet
 * drink for a hot day") and the current menu, and returns structured
 * cart suggestions. We give Claude a tightly-shaped menu summary
 * (slug, name, price-LE, allergens, size labels, available modifier
 * groups) rather than raw Payload records — smaller token footprint
 * and easier to validate the response against.
 */

export interface MenuItemForAI {
  readonly id: string | number;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly section: string;
  readonly basePriceQirsh: number;
  readonly allergens: ReadonlyArray<string>;
  readonly sizes: ReadonlyArray<{
    readonly label: string;
    readonly value: string;
    readonly priceQirsh: number;
  }>;
  readonly modifierGroupSlugs: ReadonlyArray<string>;
  readonly available: boolean;
}

export interface ModifierGroupForAI {
  readonly slug: string;
  readonly name: string;
  readonly minSelectable: number;
  readonly maxSelectable: number;
  readonly options: ReadonlyArray<{
    readonly value: string;
    readonly label: string;
    readonly priceDelta: number;
  }>;
}

function formatLE(qirsh: number): string {
  return `${(qirsh / 100).toFixed(0)} LE`;
}

/**
 * Render the menu as a compact markdown-ish block suitable for an
 * Anthropic system prompt. Only includes available items — there's no
 * point recommending an 86'd item.
 */
export function formatMenuForPrompt(input: {
  readonly items: ReadonlyArray<MenuItemForAI>;
  readonly modifierGroups: ReadonlyArray<ModifierGroupForAI>;
}): string {
  const groupsBySlug = new Map(
    input.modifierGroups.map((g) => [g.slug, g] as const),
  );
  const sections = new Map<string, MenuItemForAI[]>();
  for (const item of input.items) {
    if (!item.available) continue;
    const list = sections.get(item.section) ?? [];
    list.push(item);
    sections.set(item.section, list);
  }

  const lines: string[] = [];
  for (const [section, items] of sections) {
    lines.push(`## ${section}`);
    for (const item of items) {
      const priceBit =
        item.sizes.length > 0
          ? item.sizes
              .map((s) => `${s.label} ${formatLE(s.priceQirsh)}`)
              .join(" / ")
          : formatLE(item.basePriceQirsh);
      lines.push(`- [${item.slug}] **${item.name}** — ${priceBit}`);
      if (item.description) {
        lines.push(`  ${item.description}`);
      }
      if (item.allergens.length > 0) {
        lines.push(`  Allergens: ${item.allergens.join(", ")}`);
      }
      if (item.modifierGroupSlugs.length > 0) {
        for (const slug of item.modifierGroupSlugs) {
          const g = groupsBySlug.get(slug);
          if (!g) continue;
          const opts = g.options
            .map(
              (o) =>
                `${o.value}=${o.label}${
                  o.priceDelta ? ` (+${formatLE(o.priceDelta)})` : ""
                }`,
            )
            .join("; ");
          lines.push(
            `  Modifier "${g.slug}" (pick ${g.minSelectable}-${g.maxSelectable}): ${opts}`,
          );
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

// ── Response parsing ────────────────────────────────────────────────────────

export interface AssistantSuggestion {
  readonly itemSlug: string;
  readonly sizeValue: string | null;
  readonly modifierSelections: ReadonlyArray<{
    readonly groupSlug: string;
    readonly optionValues: ReadonlyArray<string>;
  }>;
  readonly quantity: number;
  readonly reason: string;
}

export interface ParseResult {
  readonly suggestions: ReadonlyArray<AssistantSuggestion>;
  readonly explanation: string;
  readonly droppedCount: number;
}

interface CandidateSuggestion {
  itemSlug?: unknown;
  sizeValue?: unknown;
  modifierSelections?: unknown;
  quantity?: unknown;
  reason?: unknown;
}

interface CandidatePayload {
  suggestions?: ReadonlyArray<CandidateSuggestion>;
  explanation?: unknown;
}

/**
 * Validate the AI's structured response against the known menu. Drops
 * suggestions for unknown items, clamps quantity to 1–10, ignores
 * modifier picks that aren't in the catalogue. Returns droppedCount so
 * the route can warn the guest if nothing useful came back.
 */
export function parseAssistantResponse(input: {
  readonly raw: unknown;
  readonly knownItemSlugs: ReadonlySet<string>;
  readonly knownModifierGroupSlugs: ReadonlySet<string>;
}): ParseResult {
  const payload = (input.raw ?? {}) as CandidatePayload;
  const list = Array.isArray(payload.suggestions) ? payload.suggestions : [];
  const out: AssistantSuggestion[] = [];
  let dropped = 0;

  for (const candidate of list) {
    if (typeof candidate.itemSlug !== "string") {
      dropped++;
      continue;
    }
    if (!input.knownItemSlugs.has(candidate.itemSlug)) {
      dropped++;
      continue;
    }

    const quantity = clampQuantity(candidate.quantity);
    const sizeValue =
      typeof candidate.sizeValue === "string" && candidate.sizeValue.length > 0
        ? candidate.sizeValue
        : null;
    const reason =
      typeof candidate.reason === "string" ? candidate.reason : "";

    const rawMods: ReadonlyArray<unknown> = Array.isArray(
      candidate.modifierSelections,
    )
      ? (candidate.modifierSelections as ReadonlyArray<unknown>)
      : [];

    const mods: Array<{
      groupSlug: string;
      optionValues: ReadonlyArray<string>;
    }> = [];
    for (const m of rawMods) {
      if (typeof m !== "object" || m === null) continue;
      const obj = m as { groupSlug?: unknown; optionValues?: unknown };
      if (
        typeof obj.groupSlug !== "string" ||
        !input.knownModifierGroupSlugs.has(obj.groupSlug)
      ) {
        continue;
      }
      if (!Array.isArray(obj.optionValues)) continue;
      const optionValues = (obj.optionValues as ReadonlyArray<unknown>).filter(
        (v): v is string => typeof v === "string",
      );
      mods.push({ groupSlug: obj.groupSlug, optionValues });
    }

    out.push({
      itemSlug: candidate.itemSlug,
      sizeValue,
      modifierSelections: mods,
      quantity,
      reason,
    });
  }

  return {
    suggestions: out,
    explanation:
      typeof payload.explanation === "string" ? payload.explanation : "",
    droppedCount: dropped,
  };
}

function clampQuantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(10, Math.floor(value)));
}
