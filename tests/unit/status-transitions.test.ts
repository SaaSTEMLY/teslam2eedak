import { describe, test, expect } from "vitest";
import {
  validateTransition,
  nextAllowed,
} from "@/lib/ordering/status-transitions";

describe("validateTransition", () => {
  test("happy path placed → preparing → ready → delivered all valid", () => {
    expect(validateTransition("placed", "preparing")).toBe(null);
    expect(validateTransition("preparing", "ready")).toBe(null);
    expect(validateTransition("ready", "delivered")).toBe(null);
  });

  test("staff can cancel from any non-terminal state", () => {
    expect(validateTransition("placed", "cancelled")).toBe(null);
    expect(validateTransition("preparing", "cancelled")).toBe(null);
    expect(validateTransition("ready", "cancelled")).toBe(null);
  });

  test("skipping a stage is forbidden", () => {
    expect(validateTransition("placed", "ready")?.kind).toBe("not-allowed");
    expect(validateTransition("placed", "delivered")?.kind).toBe("not-allowed");
    expect(validateTransition("preparing", "delivered")?.kind).toBe(
      "not-allowed",
    );
  });

  test("going backwards is forbidden", () => {
    expect(validateTransition("ready", "preparing")?.kind).toBe("not-allowed");
    expect(validateTransition("preparing", "placed")?.kind).toBe("not-allowed");
  });

  test("delivered is terminal — no transitions out", () => {
    expect(validateTransition("delivered", "placed")?.kind).toBe("terminal");
    expect(validateTransition("delivered", "cancelled")?.kind).toBe("terminal");
  });

  test("cancelled is terminal — no transitions out, including to delivered", () => {
    expect(validateTransition("cancelled", "delivered")?.kind).toBe("terminal");
    expect(validateTransition("cancelled", "placed")?.kind).toBe("terminal");
  });

  test("transition to same state is rejected with same-state", () => {
    expect(validateTransition("placed", "placed")?.kind).toBe("same-state");
    expect(validateTransition("preparing", "preparing")?.kind).toBe(
      "same-state",
    );
  });
});

describe("nextAllowed", () => {
  test("returns the allowed transitions for each non-terminal state", () => {
    expect(nextAllowed("placed")).toEqual(["preparing", "cancelled"]);
    expect(nextAllowed("preparing")).toEqual(["ready", "cancelled"]);
    expect(nextAllowed("ready")).toEqual(["delivered", "cancelled"]);
  });

  test("terminal states have no allowed transitions", () => {
    expect(nextAllowed("delivered")).toEqual([]);
    expect(nextAllowed("cancelled")).toEqual([]);
  });
});
