import { describe, test, expect } from "vitest";
import { pickPaymentProvider } from "@/lib/ordering/payment-provider";

describe("pickPaymentProvider", () => {
  test("stripe is allowed for dine-in when branch allows it", () => {
    const r = pickPaymentProvider({
      chosenProviderId: "stripe",
      fulfillmentMode: "dine-in",
      branchAllowedProviders: ["stripe", "cash-on-pickup"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.provider.id).toBe("stripe");
  });

  test("stripe is allowed for pickup, delivery and merch", () => {
    for (const mode of ["pickup", "delivery", "merch"] as const) {
      const r = pickPaymentProvider({
        chosenProviderId: "stripe",
        fulfillmentMode: mode,
        branchAllowedProviders: ["stripe"],
      });
      expect(r.ok).toBe(true);
    }
  });

  test("cash-on-pickup is hard-blocked for dine-in even if branch allows it", () => {
    const r = pickPaymentProvider({
      chosenProviderId: "cash-on-pickup",
      fulfillmentMode: "dine-in",
      branchAllowedProviders: ["stripe", "cash-on-pickup"],
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("wrong-fulfillment-mode");
  });

  test("cash-on-pickup is allowed for pickup", () => {
    const r = pickPaymentProvider({
      chosenProviderId: "cash-on-pickup",
      fulfillmentMode: "pickup",
      branchAllowedProviders: ["stripe", "cash-on-pickup"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.provider.id).toBe("cash-on-pickup");
      expect(r.provider.settlesUpfront).toBe(false);
    }
  });

  test("cash-on-pickup is blocked for delivery and merch", () => {
    for (const mode of ["delivery", "merch"] as const) {
      const r = pickPaymentProvider({
        chosenProviderId: "cash-on-pickup",
        fulfillmentMode: mode,
        branchAllowedProviders: ["cash-on-pickup"],
      });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe("wrong-fulfillment-mode");
    }
  });

  test("rejects providers not allowed at the branch", () => {
    const r = pickPaymentProvider({
      chosenProviderId: "cash-on-pickup",
      fulfillmentMode: "pickup",
      branchAllowedProviders: ["stripe"], // branch doesn't accept cash
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("not-allowed-at-branch");
  });

  test("unknown future provider returned by config produces unknown-provider", () => {
    const r = pickPaymentProvider({
      chosenProviderId: "paymob",
      fulfillmentMode: "pickup",
      branchAllowedProviders: ["paymob"],
    });
    // Paymob is in the catalog but the adapter is not implemented yet.
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("unknown-provider");
  });
});
