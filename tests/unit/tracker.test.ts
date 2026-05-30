import { describe, test, expect } from "vitest";
import {
  statusProgressFraction,
  isTerminalStatus,
  estimateEta,
  statusLabel,
  KITCHEN_STATUSES,
} from "@/lib/ordering/tracker";

describe("status helpers", () => {
  test("KITCHEN_STATUSES is the canonical order placed → cancelled", () => {
    expect(KITCHEN_STATUSES).toEqual([
      "placed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ]);
  });

  test("isTerminalStatus only true for delivered or cancelled", () => {
    expect(isTerminalStatus("placed")).toBe(false);
    expect(isTerminalStatus("preparing")).toBe(false);
    expect(isTerminalStatus("ready")).toBe(false);
    expect(isTerminalStatus("delivered")).toBe(true);
    expect(isTerminalStatus("cancelled")).toBe(true);
  });

  test("progress increases monotonically through happy path", () => {
    const placed = statusProgressFraction({ status: "placed" });
    const preparing = statusProgressFraction({ status: "preparing" });
    const ready = statusProgressFraction({ status: "ready" });
    const delivered = statusProgressFraction({ status: "delivered" });
    expect(placed).toBeLessThan(preparing);
    expect(preparing).toBeLessThan(ready);
    expect(ready).toBeLessThan(delivered);
    expect(delivered).toBe(1);
  });

  test("cancelled has zero progress (kanban shows the destructive bar)", () => {
    expect(statusProgressFraction({ status: "cancelled" })).toBe(0);
  });

  test("statusLabel returns friendly text for every state", () => {
    for (const s of KITCHEN_STATUSES) {
      expect(typeof statusLabel(s)).toBe("string");
      expect(statusLabel(s).length).toBeGreaterThan(0);
    }
  });
});

describe("estimateEta", () => {
  const placedAt = new Date("2026-05-30T10:00:00Z");

  test("returns null window for terminal statuses", () => {
    for (const s of ["delivered", "cancelled"] as const) {
      const r = estimateEta({
        status: s,
        placedAt,
        lineItems: [{ prepTimeMinutes: 4, quantity: 1 }],
      });
      expect(r.readyAt).toBe(null);
      expect(r.minutesRemaining).toBe(null);
    }
  });

  test("returns null window when status === ready (it's right there)", () => {
    const r = estimateEta({
      status: "ready",
      placedAt,
      lineItems: [{ prepTimeMinutes: 4, quantity: 1 }],
    });
    expect(r.readyAt).toBe(null);
  });

  test("uses the longest-prep item × (queue + 1) as the target", () => {
    const r = estimateEta({
      status: "placed",
      placedAt,
      lineItems: [
        { prepTimeMinutes: 2, quantity: 1 }, // espresso
        { prepTimeMinutes: 8, quantity: 1 }, // benedict
      ],
      queueAheadCount: 1,
      now: new Date(placedAt.getTime() + 60_000), // 1 min later
    });
    // 8 minutes × 2 (this + 1 ahead) = 16 minutes target, 1 elapsed = 15 left
    expect(r.minutesRemaining).toBe(15);
    expect(r.readyAt?.toISOString()).toBe("2026-05-30T10:16:00.000Z");
  });

  test("minutesRemaining floors at zero (never negative)", () => {
    const r = estimateEta({
      status: "preparing",
      placedAt,
      lineItems: [{ prepTimeMinutes: 2, quantity: 1 }],
      now: new Date(placedAt.getTime() + 60 * 60_000), // 1h later
    });
    expect(r.minutesRemaining).toBe(0);
  });

  test("clamps to a minimum 2-minute target so the UI never shows 'instant'", () => {
    const r = estimateEta({
      status: "placed",
      placedAt,
      lineItems: [{ prepTimeMinutes: 0, quantity: 1 }],
      now: placedAt,
    });
    expect(r.minutesRemaining).toBe(2);
  });
});
