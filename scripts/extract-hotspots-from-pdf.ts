/**
 * Refine the menu-item hotspot boxes by reading the menu PDF's
 * embedded text positions (extracted earlier via:
 *   pdftotext -bbox-layout public/menu.pdf /tmp/menu-bbox.html
 * ).
 *
 * Each PDF page (A3, 841.89 × 1190.55 pts) corresponds 1:1 to one of
 * menu1/menu2/menu3.jpg. For each seeded item slug, we find the
 * matching line on its page and emit a generous row-shaped box:
 *   x = column-left, w = column-width
 *   y = line-top, h = ~2× line-height
 *
 * Generous-row coordinates beat tight-text-bbox coordinates because
 * the goal is a comfortable tap target, not pixel-perfect text
 * highlighting.
 *
 * Output: writes the refined { slug → hotspots[] } into the database
 * via libsql, replacing whatever the vision-only pass put there.
 *
 *   bun scripts/extract-hotspots-from-pdf.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const PDF_W = 841.89;
const PDF_H = 1190.55;
const LOCALES = ["en", "ar"] as const;

interface Word {
  text: string;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

interface Line {
  page: number;
  text: string;
  words: Word[];
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

function parseBbox(html: string): Line[] {
  // Each <page> contains <flow>/<block>/<line>/<word>. We only need lines.
  const lines: Line[] = [];
  const pages = html.split(/<page\b/);
  // pages[0] is the prefix, pages[1..] are real pages.
  for (let i = 1; i < pages.length; i++) {
    const pageChunk = pages[i]!;
    const pageNum = i; // 1-indexed
    const lineMatches = pageChunk.matchAll(
      /<line\s+xMin="([\d.]+)"\s+yMin="([\d.]+)"\s+xMax="([\d.]+)"\s+yMax="([\d.]+)"\s*>([\s\S]*?)<\/line>/g,
    );
    for (const match of lineMatches) {
      const xMin = Number(match[1]);
      const yMin = Number(match[2]);
      const xMax = Number(match[3]);
      const yMax = Number(match[4]);
      const inner = match[5]!;
      const wordMatches = inner.matchAll(
        /<word\s+xMin="([\d.]+)"\s+yMin="([\d.]+)"\s+xMax="([\d.]+)"\s+yMax="([\d.]+)"\s*>([^<]*)<\/word>/g,
      );
      const words: Word[] = [];
      for (const w of wordMatches) {
        words.push({
          text: (w[5] ?? "").trim(),
          xMin: Number(w[1]),
          yMin: Number(w[2]),
          xMax: Number(w[3]),
          yMax: Number(w[4]),
        });
      }
      const text = words.map((w) => w.text).join(" ");
      if (text.length === 0) continue;
      lines.push({
        page: pageNum,
        text,
        words,
        xMin,
        yMin,
        xMax,
        yMax,
      });
    }
  }
  return lines;
}

interface Target {
  slug: string;
  page: 1 | 2 | 3;
  // Word sequence (case-insensitive) to look for. We search ALL words
  // on the target page, not joined-line text — pdftotext sometimes
  // splits adjacent words into different <line> blocks (e.g., ICED
  // ends up on its own line above SALTED CARAMEL). Word-level
  // matching: find the first word matching `match[0]`, then require
  // `match[1..]` to follow within `wordsWindow` slots and within a
  // small y-delta.
  match: string[];
  // Optional negative match — reject lines containing this substring.
  reject?: string;
  // Optional column constraint: 'left' = xMin < page-mid, 'right' = xMin > page-mid.
  column?: "left" | "right";
}

const TARGETS: Target[] = [
  // menu1 (PDF page 1) — Sip Into Summer (drinks)
  { slug: "espresso", page: 1, match: ["ESPRESSO"], reject: "MAKKHIATO", column: "left" },
  { slug: "flat-white", page: 1, match: ["FLAT", "WHITE"], column: "left" },
  { slug: "spanish-latte", page: 1, match: ["SPANISH", "LATTE"], reject: "BLENDED", column: "left" },
  { slug: "salted-karamel", page: 1, match: ["SALTED", "CARAMEL"], reject: "ICED", column: "left" },
  { slug: "iced-latte", page: 1, match: ["ICED", "LATTE"], column: "left" },
  { slug: "iced-salted-caramel", page: 1, match: ["ICED", "SALTED", "CARAMEL"], column: "left" },
  { slug: "caramel-klassic", page: 1, match: ["CARAMEL", "KLASSIC"], column: "right" },
  // menu3 (PDF page 3) — All Day Menu
  { slug: "salty-truffle-bagel", page: 3, match: ["SALTY", "TRUFFLE"], column: "left" },
  { slug: "philly-steak-wich", page: 3, match: ["PHILLY"], column: "left" },
  { slug: "quinoa-lover", page: 3, match: ["QUINOA"], column: "right" },
  { slug: "mood-boost-salad", page: 3, match: ["MOOD"], column: "right" },
  { slug: "kult-made-cookies", page: 3, match: ["KULT", "MADE"], column: "right" },
];

// Page-local column hints for the row-expansion logic. PDF coordinates
// are in pts (page is 841.89 × 1190.55).
interface ColumnHint {
  // Inclusive midpoint x — if the matched line's center is left of this,
  // it's the left column; otherwise right column.
  splitX: number;
  // The two columns' x-ranges, used to expand the box to full-width.
  left: { xMin: number; xMax: number };
  right: { xMin: number; xMax: number };
}

const COLUMNS: Record<number, ColumnHint> = {
  // Inspecting the PDF: left column item names start ~x=24, prices end
  // ~x=180. Right column starts ~x=400 (NON KOFFEE/MOJITOS section is
  // slightly left of MATCHA KULTURE which starts ~x=476), prices end
  // ~x=640. Page is 841 wide.
  1: {
    splitX: 380,
    left: { xMin: 18, xMax: 180 },
    right: { xMin: 400, xMax: 640 },
  },
  3: {
    splitX: 420,
    left: { xMin: 18, xMax: 380 },
    right: { xMin: 458, xMax: 800 },
  },
};

interface NormalizedBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

function findRowBox(lines: Line[], target: Target): NormalizedBox | null {
  // Flatten all words on the target page (some line groupings split a
  // visual row into multiple <line> blocks).
  const pageWords: Word[] = [];
  for (const line of lines) {
    if (line.page === target.page) pageWords.push(...line.words);
  }

  const cols = COLUMNS[target.page];
  const inColumn = (w: Word): boolean => {
    if (!target.column || !cols) return true;
    return target.column === "left"
      ? w.xMin < cols.splitX
      : w.xMin >= cols.splitX;
  };

  // Find candidate starting words: words matching match[0] in the right column.
  const firstUpper = target.match[0]!.toUpperCase();
  const candidates = pageWords.filter(
    (w) => w.text.toUpperCase() === firstUpper && inColumn(w),
  );

  // For each candidate, verify subsequent words from match[1..] appear
  // within ~250pt horizontally and within ~half-a-line-height vertically.
  const HORIZONTAL_GAP_MAX = 250;
  let winner: { xMin: number; yMin: number; xMax: number; yMax: number } | null = null;
  for (const c of candidates) {
    // Reject lines containing the reject word, anywhere within
    // ~one-line vertical distance.
    if (target.reject) {
      const rejectU = target.reject.toUpperCase();
      const onSameRow = pageWords.some(
        (w) =>
          Math.abs(w.yMin - c.yMin) < 12 &&
          w.text.toUpperCase().includes(rejectU),
      );
      if (onSameRow) continue;
    }

    // Greedily advance through match[1..], picking the closest matching
    // word to the right of the previous one.
    let cursor = c;
    let ok = true;
    let rightmost = c;
    for (let i = 1; i < target.match.length; i++) {
      const expect = target.match[i]!.toUpperCase();
      const next = pageWords
        .filter(
          (w) =>
            w.text.toUpperCase() === expect &&
            w.xMin > cursor.xMin &&
            w.xMin - cursor.xMax < HORIZONTAL_GAP_MAX &&
            Math.abs(w.yMin - cursor.yMin) < 12,
        )
        .sort((a, b) => a.xMin - b.xMin)[0];
      if (!next) {
        ok = false;
        break;
      }
      cursor = next;
      if (cursor.xMax > rightmost.xMax) rightmost = cursor;
    }
    if (!ok) continue;
    if (!winner || c.yMin < winner.yMin) {
      winner = {
        xMin: c.xMin,
        yMin: c.yMin,
        xMax: rightmost.xMax,
        yMax: Math.max(c.yMax, rightmost.yMax),
      };
    }
  }

  if (!winner) return null;

  const lineMidX = (winner.xMin + winner.xMax) / 2;
  const range =
    cols && lineMidX < cols.splitX
      ? cols.left
      : cols
        ? cols.right
        : { xMin: winner.xMin, xMax: winner.xMax };

  const lineHeight = winner.yMax - winner.yMin;
  const yPad = lineHeight * 0.4;

  const x = range.xMin / PDF_W;
  const y = Math.max(0, (winner.yMin - yPad) / PDF_H);
  const w = (range.xMax - range.xMin) / PDF_W;
  const h = Math.min(1 - y, (lineHeight + yPad * 2) / PDF_H);
  return { x, y, w, h };
}

async function main() {
  const html = readFileSync("/tmp/menu-bbox.html", "utf8");
  const lines = parseBbox(html);
  console.log(`[pdf] parsed ${lines.length} lines across pages`);

  const url = process.env.DATABASE_URL ?? process.env.TURSO_DATABASE_URL;
  const authToken =
    process.env.DATABASE_AUTH_TOKEN ?? process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = createClient({ url, authToken });

  let updated = 0;
  let missing = 0;
  for (const target of TARGETS) {
    const box = findRowBox(lines, target);
    if (!box) {
      console.warn(
        `  ${target.slug.padEnd(28)} MISSING — no PDF line matched "${target.match}"`,
      );
      missing++;
      continue;
    }

    const menuImageId = `menu${target.page}`;
    const hotspots = LOCALES.map((locale) => ({
      locale,
      menuImageId,
      x: Number(box.x.toFixed(4)),
      y: Number(box.y.toFixed(4)),
      w: Number(box.w.toFixed(4)),
      h: Number(box.h.toFixed(4)),
    }));

    const result = await client.execute({
      sql: `UPDATE products SET hotspot_boxes = ? WHERE slug = ?`,
      args: [JSON.stringify(hotspots), target.slug],
    });
    const ok = result.rowsAffected > 0;
    if (ok) updated++;
    console.log(
      `  ${target.slug.padEnd(28)} → x=${box.x.toFixed(3)} y=${box.y.toFixed(3)} w=${box.w.toFixed(3)} h=${box.h.toFixed(3)} ${ok ? "✓" : "(no row updated — slug not in DB)"}`,
    );
  }

  console.log(
    `\n[pdf] ${updated}/${TARGETS.length} hotspots refined from PDF coords; ${missing} missing`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
