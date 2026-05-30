import { describe, test, expect } from "vitest";
import {
  validatePaymentTransition,
  nextAllowedPaymentStatuses,
} from "@/lib/ordering/payment-status";

describe("validatePaymentTransition", () => {
  test("pending → paid is the cash-settlement path", () => {
    expect(validatePaymentTransition("pending", "paid")).toBe(null);
  });

  test("pending → refunded is the cancelled-before-pay path", () => {
    expect(validatePaymentTransition("pending", "refunded")).toBe(null);
  });

  test("paid → refunded is the standard refund path", () => {
    expect(validatePaymentTransition("paid", "refunded")).toBe(null);
  });

  test("paid → pending is rejected (can't un-pay)", () => {
    expect(validatePaymentTransition("paid", "pending")?.kind).toBe(
      "not-allowed",
    );
  });

  test("refunded is terminal", () => {
    expect(validatePaymentTransition("refunded", "paid")?.kind).toBe(
      "terminal",
    );
    expect(validatePaymentTransition("refunded", "pending")?.kind).toBe(
      "terminal",
    );
  });

  test("same-state transitions are rejected", () => {
    expect(validatePaymentTransition("pending", "pending")?.kind).toBe(
      "same-state",
    );
    expect(validatePaymentTransition("paid", "paid")?.kind).toBe("same-state");
  });
});

describe("nextAllowedPaymentStatuses", () => {
  test("pending allows both paid and refunded", () => {
    expect(nextAllowedPaymentStatuses("pending")).toEqual([
      "paid",
      "refunded",
    ]);
  });

  test("paid allows only refunded", () => {
    expect(nextAllowedPaymentStatuses("paid")).toEqual(["refunded"]);
  });

  test("refunded is terminal", () => {
    expect(nextAllowedPaymentStatuses("refunded")).toEqual([]);
  });
});
