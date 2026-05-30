import { describe, test, expect } from "vitest";
import { decidePaymentIntent } from "@/lib/ordering/payment-intent";

const base = {
  providerId: "stripe" as const,
  providerSettlesUpfront: true,
  amountQirsh: 11_500,
  orderId: 42,
  fulfillmentMode: "dine-in" as const,
  locationId: 1,
  tableId: 7 as string | number | null,
};

describe("decidePaymentIntent", () => {
  test("stripe + dine-in creates a payment intent", () => {
    const d = decidePaymentIntent(base);
    expect(d.shouldCreate).toBe(true);
    expect(d.amount).toBe(11_500);
    expect(d.currency).toBe("egp");
  });

  test("cash-on-pickup never creates an intent even if marked settles-upfront", () => {
    const d = decidePaymentIntent({
      ...base,
      providerId: "cash-on-pickup",
      providerSettlesUpfront: true, // hypothetical
    });
    expect(d.shouldCreate).toBe(false);
  });

  test("pickup with stripe still creates an intent (online pay before walk-in)", () => {
    const d = decidePaymentIntent({
      ...base,
      fulfillmentMode: "pickup",
      tableId: null,
    });
    expect(d.shouldCreate).toBe(true);
  });

  test("metadata carries the order context for webhook correlation", () => {
    const d = decidePaymentIntent(base);
    expect(d.metadata).toMatchObject({
      orderId: "42",
      fulfillmentMode: "dine-in",
      locationId: "1",
      tableId: "7",
      restaurantId: "kk-main",
    });
  });

  test("metadata omits tableId when not provided (pickup path)", () => {
    const d = decidePaymentIntent({
      ...base,
      fulfillmentMode: "pickup",
      tableId: null,
    });
    expect("tableId" in d.metadata).toBe(false);
  });

  test("idempotency key encodes order id and amount — duplicate POSTs are safe", () => {
    const a = decidePaymentIntent(base);
    const b = decidePaymentIntent(base);
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
  });

  test("changing the amount changes the idempotency key (so a re-priced order gets a new intent)", () => {
    const a = decidePaymentIntent(base);
    const b = decidePaymentIntent({ ...base, amountQirsh: 12_000 });
    expect(a.idempotencyKey).not.toBe(b.idempotencyKey);
  });
});
