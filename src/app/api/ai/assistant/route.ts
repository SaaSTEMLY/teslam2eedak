import Anthropic from "@anthropic-ai/sdk";
import { Effect } from "effect";

import {
  AppLive,
  Payload,
  ExternalServiceError,
  ValidationError,
  handleRoute,
  ok,
  parseBody,
} from "@/lib/effect";
import {
  formatMenuForPrompt,
  parseAssistantResponse,
  type MenuItemForAI,
  type ModifierGroupForAI,
} from "@/lib/ai/menu-context";
import { checkRateLimit } from "@/lib/effect";

import { assistantQuerySchema } from "./schema";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const RATE_LIMIT = { maxRequests: 8, windowMs: 60_000 };

/**
 * POST /api/ai/assistant
 *
 * Free-text guest query → structured cart suggestions. Anonymous
 * (rate-limited per IP) so customers don't need to log in to ask
 * "I want a strong sweet drink for a hot day."
 *
 * Gracefully degrades when ANTHROPIC_API_KEY is missing — returns a
 * 503 with a friendly message so the UI can fall back to the menu.
 *
 * Uses prompt caching on the menu prefix so repeated queries against
 * the same menu re-use the cached input tokens.
 */
export const POST = (req: Request) =>
  handleRoute(
    Effect.gen(function* () {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return yield* Effect.fail(
          new ExternalServiceError({
            service: "Anthropic",
            operation: "missing-key",
            cause: "ANTHROPIC_API_KEY not configured",
          }),
        );
      }

      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        req.headers.get("x-real-ip") ??
        "anonymous";
      yield* checkRateLimit({
        key: `ai:assistant:${ip}`,
        maxRequests: RATE_LIMIT.maxRequests,
        windowMs: RATE_LIMIT.windowMs,
      });

      const input = yield* parseBody(assistantQuerySchema, req);
      const db = yield* Payload;

      const productResult = yield* db.find({
        collection: "products",
        where: {
          and: [
            { _status: { equals: "published" } },
            { isAvailable: { equals: true } },
          ],
        },
        limit: 200,
      });
      const modifierResult = yield* db.find({
        collection: "modifier-groups",
        limit: 200,
      });

      const items = mapProductsForAI(productResult.docs);
      const groups = mapModifierGroupsForAI(modifierResult.docs);

      if (items.length === 0) {
        return yield* Effect.fail(
          new ValidationError({
            message: "No menu items available to recommend from",
            details: { fulfillmentMode: input.fulfillmentMode },
          }),
        );
      }

      const menuContext = formatMenuForPrompt({ items, modifierGroups: groups });
      const knownItemSlugs = new Set(items.map((i) => i.slug));
      const knownGroupSlugs = new Set(groups.map((g) => g.slug));

      const client = new Anthropic({ apiKey });
      const completion = yield* Effect.tryPromise({
        try: () =>
          client.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: [
              {
                type: "text",
                text: SYSTEM_PROMPT,
              },
              {
                type: "text",
                text: `Menu:\n\n${menuContext}`,
                cache_control: { type: "ephemeral" },
              },
            ],
            messages: [
              {
                role: "user",
                content: buildUserMessage({
                  query: input.query,
                  fulfillmentMode: input.fulfillmentMode,
                  dietaryPreferences: input.dietaryPreferences,
                }),
              },
            ],
          }),
        catch: (cause) =>
          new ExternalServiceError({
            service: "Anthropic",
            operation: "messages.create",
            cause,
          }),
      });

      const raw = extractJsonFromCompletion(completion);
      const parsed = parseAssistantResponse({
        raw,
        knownItemSlugs,
        knownModifierGroupSlugs: knownGroupSlugs,
      });

      return ok({
        suggestions: parsed.suggestions,
        explanation: parsed.explanation,
        droppedCount: parsed.droppedCount,
        model: MODEL,
      });
    }).pipe(Effect.provide(AppLive)),
  );

const SYSTEM_PROMPT = `You are Koffee Kulture's ordering assistant. The guest gives a short free-text request; you respond with at most 3 structured menu-item suggestions in JSON.

Rules:
- Only suggest items whose [slug] appears in the menu.
- Only suggest modifier choices whose slugs appear in the menu.
- Honour the dietary preferences supplied — never suggest an item that contradicts them.
- Keep each "reason" under 18 words, written in the same warm voice the brand uses ("the Kulture", lowercase k-letter swaps like Koffee/Kulture/Klassiks are fine).
- If the guest's query doesn't map to anything on the menu, return an empty suggestions array with a polite explanation.

Respond with ONE JSON object only, with this shape:
{
  "suggestions": [
    {
      "itemSlug": "flat-white",
      "sizeValue": "l" | null,
      "modifierSelections": [
        { "groupSlug": "milk-choice", "optionValues": ["oat"] }
      ],
      "quantity": 1,
      "reason": "Velvet milk on a double shot — calm energy."
    }
  ],
  "explanation": "Short overall note to the guest, under 30 words."
}

No prose outside the JSON. No code fences.`;

function buildUserMessage(input: {
  query: string;
  fulfillmentMode: string;
  dietaryPreferences: ReadonlyArray<string>;
}): string {
  const prefBit =
    input.dietaryPreferences.length > 0
      ? `Dietary preferences: ${input.dietaryPreferences.join(", ")}.`
      : "";
  return [
    `Order type: ${input.fulfillmentMode}.`,
    prefBit,
    "",
    "Guest says:",
    input.query.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

interface AnthropicMessage {
  content: ReadonlyArray<{ type: string; text?: string }>;
}

function extractJsonFromCompletion(completion: AnthropicMessage): unknown {
  const text = completion.content
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim();
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }
  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

// ── Payload doc → AI shape ──────────────────────────────────────────────────

interface ProductDoc {
  id: string | number;
  slug?: string;
  name?: string;
  description?: string;
  menuSection?: string;
  priceInUSD?: number;
  allergens?: ReadonlyArray<string>;
  sizes?: ReadonlyArray<{ label?: string; value?: string; priceInUSD?: number }>;
  modifierGroups?: ReadonlyArray<string | number | { id: string | number; slug?: string }>;
  isAvailable?: boolean;
}

interface ModifierGroupDoc {
  id: string | number;
  slug?: string;
  name?: string;
  minSelectable?: number;
  maxSelectable?: number;
  options?: ReadonlyArray<{
    label?: string;
    value?: string;
    priceDelta?: number;
  }>;
}

function mapProductsForAI(docs: unknown[]): MenuItemForAI[] {
  const out: MenuItemForAI[] = [];
  for (const raw of docs as ProductDoc[]) {
    if (!raw.slug || !raw.name) continue;
    const modifierGroupSlugs: string[] = [];
    for (const ref of raw.modifierGroups ?? []) {
      if (typeof ref === "object" && ref !== null && "slug" in ref && ref.slug) {
        modifierGroupSlugs.push(ref.slug as string);
      }
    }
    out.push({
      id: raw.id,
      slug: raw.slug,
      name: raw.name,
      description: raw.description ?? "",
      section: raw.menuSection ?? "Menu",
      basePriceQirsh: raw.priceInUSD ?? 0,
      allergens: raw.allergens ?? [],
      sizes: (raw.sizes ?? []).map((s) => ({
        label: s.label ?? "",
        value: s.value ?? "",
        priceQirsh: s.priceInUSD ?? raw.priceInUSD ?? 0,
      })),
      modifierGroupSlugs,
      available: raw.isAvailable !== false,
    });
  }
  return out;
}

function mapModifierGroupsForAI(docs: unknown[]): ModifierGroupForAI[] {
  return (docs as ModifierGroupDoc[])
    .filter((d) => Boolean(d.slug))
    .map((d) => ({
      slug: d.slug as string,
      name: d.name ?? d.slug as string,
      minSelectable: d.minSelectable ?? 0,
      maxSelectable: d.maxSelectable ?? 1,
      options: (d.options ?? []).map((o) => ({
        value: o.value ?? "",
        label: o.label ?? "",
        priceDelta: o.priceDelta ?? 0,
      })),
    }));
}
