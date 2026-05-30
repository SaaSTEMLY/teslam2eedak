/**
 * Fulfillment modes carried on Cart and Order. All four are accepted in the
 * schema from day 1 even though MVP only ships `dine-in` and `pickup`
 * (per ADR-0003 / GOAL §12 #6). Delivery and merch land in a later chunk.
 */

export const FULFILLMENT_MODES = [
  "dine-in",
  "pickup",
  "delivery",
  "merch",
] as const;

export type FulfillmentMode = (typeof FULFILLMENT_MODES)[number];

export function isFulfillmentMode(value: unknown): value is FulfillmentMode {
  return (
    typeof value === "string" &&
    (FULFILLMENT_MODES as ReadonlyArray<string>).includes(value)
  );
}
