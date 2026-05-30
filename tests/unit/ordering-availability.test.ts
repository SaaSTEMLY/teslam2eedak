import { describe, test, expect } from "vitest";
import { resolveItemAvailability } from "@/lib/ordering/availability";

describe("resolveItemAvailability", () => {
  test("available when isAvailable is true and no other constraint", () => {
    const r = resolveItemAvailability({ isAvailable: true });
    expect(r.available).toBe(true);
    expect(r.reason).toBe(null);
  });

  test("sold-out when isAvailable is false", () => {
    const r = resolveItemAvailability({ isAvailable: false });
    expect(r.available).toBe(false);
    expect(r.reason).toBe("sold-out");
  });

  test("branch override beats restaurant default — disabled at branch", () => {
    const r = resolveItemAvailability({
      isAvailable: true,
      locationOverride: { isAvailable: false },
    });
    expect(r.available).toBe(false);
    expect(r.reason).toBe("branch-override");
  });

  test("branch override with no isAvailable field inherits from restaurant", () => {
    const r = resolveItemAvailability({
      isAvailable: true,
      locationOverride: {},
    });
    expect(r.available).toBe(true);
  });

  test("branch override with isAvailable: true does not block sold-out", () => {
    const r = resolveItemAvailability({
      isAvailable: false,
      locationOverride: { isAvailable: true },
    });
    // Branch can't UN-sold-out an item the restaurant marked unavailable.
    // Per the resolver, restaurant default wins when branch says available.
    expect(r.available).toBe(false);
    expect(r.reason).toBe("sold-out");
  });

  test("unavailableUntil in the future blocks the item", () => {
    const future = new Date("2030-01-01T00:00:00Z");
    const r = resolveItemAvailability({
      isAvailable: true,
      unavailableUntil: future,
      now: new Date("2026-05-30T00:00:00Z"),
    });
    expect(r.available).toBe(false);
    expect(r.reason).toBe("scheduled");
  });

  test("unavailableUntil in the past auto-restocks the item", () => {
    const past = new Date("2025-01-01T00:00:00Z");
    const r = resolveItemAvailability({
      isAvailable: true,
      unavailableUntil: past,
      now: new Date("2026-05-30T00:00:00Z"),
    });
    expect(r.available).toBe(true);
    expect(r.reason).toBe(null);
  });

  test("unavailableUntil as ISO string is accepted", () => {
    const r = resolveItemAvailability({
      isAvailable: true,
      unavailableUntil: "2030-01-01T00:00:00Z",
      now: new Date("2026-05-30T00:00:00Z"),
    });
    expect(r.available).toBe(false);
    expect(r.reason).toBe("scheduled");
  });

  test("branch-override takes precedence over schedule", () => {
    const r = resolveItemAvailability({
      isAvailable: true,
      unavailableUntil: "2030-01-01T00:00:00Z",
      locationOverride: { isAvailable: false },
      now: new Date("2026-05-30T00:00:00Z"),
    });
    expect(r.available).toBe(false);
    expect(r.reason).toBe("branch-override");
  });
});
