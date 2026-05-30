/**
 * Assemble the menu-extraction proposal from:
 *   - Discovery results cached in the workflow journal (3 vision agents
 *     enumerated every item on each page).
 *   - Position results written to /tmp/positioned-output.json (the
 *     position agent finished computing precise bboxes but the
 *     workflow died right before its structured-output submission).
 *
 * Writes scripts/extracted-menu.proposal.json for operator review.
 *
 *   bun scripts/assemble-menu-proposal.ts
 */
import { readFileSync, writeFileSync } from "node:fs";

const JOURNAL =
  "/home/mk/.claude/projects/-home-mk-apps-teslam2eedak/01ed5241-0d66-49f8-b5a7-e0d7ba81078a/subagents/workflows/wf_6c3be05b-c52/journal.jsonl";

interface DiscoveredItem {
  slug: string;
  name: string;
  section: string;
  column: "left" | "right";
  basePriceQirsh: number;
  sizePrices?: ReadonlyArray<{ label: string; priceQirsh: number }>;
  description?: string;
  allergens?: ReadonlyArray<string>;
  isNew?: boolean;
  menuImageId?: "menu1" | "menu2" | "menu3";
  pdfPage?: 1 | 2 | 3;
}

interface PositionedBox {
  slug: string;
  menuImageId: "menu1" | "menu2" | "menu3";
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: "high" | "medium" | "low";
}

// ─── Read discovery results from the workflow journal ───────────────
const lines = readFileSync(JOURNAL, "utf8")
  .split("\n")
  .filter((l) => l.trim());

const discoveryResults: Array<{ items: DiscoveredItem[]; notes?: string }> = [];
for (const line of lines) {
  try {
    const entry = JSON.parse(line) as {
      type: string;
      result?: { items?: DiscoveredItem[]; notes?: string };
    };
    if (entry.type === "result" && entry.result?.items) {
      discoveryResults.push({
        items: entry.result.items,
        notes: entry.result.notes,
      });
    }
  } catch {
    // skip malformed lines
  }
}

console.log(
  `[assemble] read ${discoveryResults.length} discovery results from journal`,
);

// The 3 discovery results came back unordered. Look at their items'
// section names to infer which page each belongs to.
const PAGE_HINTS: Record<"menu1" | "menu2" | "menu3", ReadonlyArray<string>> = {
  menu1: ["Hot Klassics", "Kold Klassics", "Blended", "Matcha", "Non Koffee", "Mojitos", "Smoothies", "Refreshers", "Ice Teas"],
  menu2: ["Benedict", "Omelette", "Scrambled", "Sesame Bagel", "Tortilla", "Bakery"],
  menu3: ["Bagels", "Sandwich", "Sourdough", "Salads", "Sweet Tooth", "Open Face"],
};

function inferPage(items: DiscoveredItem[]): "menu1" | "menu2" | "menu3" {
  const counts: Record<string, number> = { menu1: 0, menu2: 0, menu3: 0 };
  for (const item of items) {
    for (const [page, hints] of Object.entries(PAGE_HINTS)) {
      for (const hint of hints) {
        if (item.section.toLowerCase().includes(hint.toLowerCase())) {
          counts[page]! += 1;
          break;
        }
      }
    }
  }
  return (Object.entries(counts).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? "menu1") as "menu1" | "menu2" | "menu3";
}

const PDF_PAGE_BY_ID = { menu1: 1, menu2: 2, menu3: 3 } as const;

const allDiscovered: DiscoveredItem[] = [];
const discoveryNotes: string[] = [];
for (const result of discoveryResults) {
  const page = inferPage(result.items);
  console.log(`  discovery batch → ${page} (${result.items.length} items)`);
  if (result.notes) discoveryNotes.push(`[${page}] ${result.notes}`);
  for (const item of result.items) {
    allDiscovered.push({
      ...item,
      menuImageId: page,
      pdfPage: PDF_PAGE_BY_ID[page],
    });
  }
}

// ─── Dedupe by slug — the cross-page assignment could overlap ──────
const dedupedBySlug = new Map<string, DiscoveredItem>();
let duplicates = 0;
for (const item of allDiscovered) {
  if (dedupedBySlug.has(item.slug)) {
    duplicates++;
    console.warn(
      `  duplicate slug "${item.slug}" — keeping first occurrence`,
    );
    continue;
  }
  dedupedBySlug.set(item.slug, item);
}
const discoveredItems = Array.from(dedupedBySlug.values());
console.log(
  `[assemble] ${discoveredItems.length} unique items (${duplicates} duplicates dropped)`,
);

// ─── Read positioned bboxes from /tmp ───────────────────────────────
const positioned = JSON.parse(
  readFileSync("/tmp/positioned-output.json", "utf8"),
) as { positioned: PositionedBox[]; missing: string[] };

console.log(
  `[assemble] positioned: ${positioned.positioned.length}, missing: ${positioned.missing.length}`,
);

// ─── Cross-check: every discovered item should have a position ─────
const positionBySlug = new Map(
  positioned.positioned.map((p) => [p.slug, p] as const),
);
const itemsWithoutHotspot = discoveredItems.filter(
  (d) => !positionBySlug.has(d.slug),
);
const positionsWithoutItem = positioned.positioned.filter(
  (p) => !dedupedBySlug.has(p.slug),
);
console.log(
  `[assemble] items without hotspot: ${itemsWithoutHotspot.length}, orphan positions: ${positionsWithoutItem.length}`,
);
if (itemsWithoutHotspot.length > 0) {
  for (const i of itemsWithoutHotspot.slice(0, 5)) {
    console.warn(`    no-hotspot: ${i.slug} (${i.name})`);
  }
}
if (positionsWithoutItem.length > 0) {
  for (const p of positionsWithoutItem.slice(0, 5)) {
    console.warn(`    orphan-pos: ${p.slug}`);
  }
}

// ─── Bbox sanity: every box has w*h > 0, all coords in [0,1] ──────
const invalidBoxes = positioned.positioned.filter(
  (p) =>
    p.x < 0 ||
    p.y < 0 ||
    p.w <= 0 ||
    p.h <= 0 ||
    p.x + p.w > 1.05 ||
    p.y + p.h > 1.05,
);
if (invalidBoxes.length > 0) {
  console.warn(`[assemble] ${invalidBoxes.length} invalid bboxes!`);
  for (const b of invalidBoxes.slice(0, 5)) console.warn("  ", b);
}

// ─── Final proposal ────────────────────────────────────────────────
const proposal = {
  source: {
    workflow: "wf_6c3be05b-c52",
    journal: JOURNAL,
    positionedFile: "/tmp/positioned-output.json",
  },
  summary: {
    discovered: discoveredItems.length,
    positioned: positioned.positioned.length,
    itemsWithoutHotspot: itemsWithoutHotspot.length,
    orphanPositions: positionsWithoutItem.length,
    invalidBboxes: invalidBoxes.length,
    confidenceBreakdown: {
      high: positioned.positioned.filter((p) => p.confidence === "high").length,
      medium: positioned.positioned.filter((p) => p.confidence === "medium").length,
      low: positioned.positioned.filter((p) => p.confidence === "low").length,
    },
    byImage: {
      menu1: discoveredItems.filter((d) => d.menuImageId === "menu1").length,
      menu2: discoveredItems.filter((d) => d.menuImageId === "menu2").length,
      menu3: discoveredItems.filter((d) => d.menuImageId === "menu3").length,
    },
    discoveryNotes,
  },
  items: discoveredItems,
  hotspots: positioned.positioned,
};

const outPath = "/home/mk/apps/teslam2eedak/scripts/extracted-menu.proposal.json";
writeFileSync(outPath, JSON.stringify(proposal, null, 2));
console.log(`\n[assemble] wrote ${outPath}`);
console.log(JSON.stringify(proposal.summary, null, 2));
