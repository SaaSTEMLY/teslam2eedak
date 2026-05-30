import { describe, test, expect } from "vitest";
import { computeCartTotals } from "@/lib/ordering/totals";

describe("computeCartTotals", () => {
  test("empty cart sums to zero", () => {
    const t = computeCartTotals({
      lineItems: [],
      fulfillmentMode: "dine-in",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.subtotal).toBe(0);
    expect(t.vatAmount).toBe(0);
    expect(t.serviceChargeAmount).toBe(0);
    expect(t.grandTotal).toBe(0);
  });

  test("dine-in adds 14% VAT and 12% service to the taxable base", () => {
    // 10,000 qirsh = 100 LE
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "dine-in",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.subtotal).toBe(10_000);
    expect(t.vatAmount).toBe(1_400);
    expect(t.serviceChargeAmount).toBe(1_200);
    expect(t.grandTotal).toBe(12_600);
  });

  test("pickup gets VAT but no service charge", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.vatAmount).toBe(1_400);
    expect(t.serviceChargeAmount).toBe(0);
    expect(t.grandTotal).toBe(11_400);
  });

  test("delivery gets VAT but no service charge", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "delivery",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.serviceChargeAmount).toBe(0);
    expect(t.grandTotal).toBe(11_400);
  });

  test("merch gets VAT but no service charge", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "merch",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.serviceChargeAmount).toBe(0);
  });

  test("discount applies to subtotal before VAT and service", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "dine-in",
      vatPercent: 14,
      serviceChargePercent: 12,
      discountAmount: 2_000,
    });
    expect(t.subtotal).toBe(10_000);
    expect(t.discountAmount).toBe(2_000);
    expect(t.taxableBase).toBe(8_000);
    expect(t.vatAmount).toBe(1_120);
    expect(t.serviceChargeAmount).toBe(960);
    expect(t.grandTotal).toBe(8_000 + 1_120 + 960);
  });

  test("discount larger than subtotal is capped", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 5_000 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
      discountAmount: 9_999_999,
    });
    expect(t.discountAmount).toBe(5_000);
    expect(t.taxableBase).toBe(0);
    expect(t.vatAmount).toBe(0);
    expect(t.grandTotal).toBe(0);
  });

  test("tip is added on top of grand total and does not affect VAT", () => {
    const baseline = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    const withTip = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
      tipAmount: 500,
    });
    expect(withTip.vatAmount).toBe(baseline.vatAmount);
    expect(withTip.tipAmount).toBe(500);
    expect(withTip.grandTotal).toBe(baseline.grandTotal + 500);
  });

  test("negative tip is treated as zero", () => {
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
      tipAmount: -100,
    });
    expect(t.tipAmount).toBe(0);
  });

  test("custom rates per branch override the default 14/12", () => {
    // Hypothetical airport branch with no service charge and 8% VAT
    const t = computeCartTotals({
      lineItems: [{ amount: 10_000 }],
      fulfillmentMode: "dine-in",
      vatPercent: 8,
      serviceChargePercent: 0,
    });
    expect(t.vatAmount).toBe(800);
    expect(t.serviceChargeAmount).toBe(0);
    expect(t.grandTotal).toBe(10_800);
  });

  test("rounds half-cent VAT correctly", () => {
    // 333 qirsh × 14% = 46.62 → 47
    const t = computeCartTotals({
      lineItems: [{ amount: 333 }],
      fulfillmentMode: "pickup",
      vatPercent: 14,
      serviceChargePercent: 12,
    });
    expect(t.vatAmount).toBe(47);
  });
});
