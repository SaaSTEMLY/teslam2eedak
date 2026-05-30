import { z } from "zod";

import { FULFILLMENT_MODES } from "@/lib/ordering/fulfillment";
import { PAYMENT_PROVIDER_IDS } from "@/lib/ordering/payment-provider";

const fulfillmentEnum = z.enum(
  FULFILLMENT_MODES as unknown as [string, ...string[]],
);
const providerEnum = z.enum(
  PAYMENT_PROVIDER_IDS as unknown as [string, ...string[]],
);

const idOrSlug = z.union([z.string().min(1), z.number().int()]);

export const placeOrderSchema = z.object({
  fulfillmentMode: fulfillmentEnum,
  locationId: idOrSlug.nullable().optional(),
  tableId: idOrSlug.nullable().optional(),
  tableShortId: z.string().nullable().optional(),
  locationSlug: z.string().nullable().optional(),
  pickupTime: z.string().datetime().nullable().optional(),
  guestSessionId: z.string().nullable().optional(),
  tipAmount: z.number().int().nonnegative().max(1_000_000).default(0),
  paymentProvider: providerEnum,
  lines: z
    .array(
      z.object({
        itemId: idOrSlug,
        sizeValue: z.string().nullable(),
        modifierSelections: z.array(
          z.object({
            groupSlug: z.string().min(1),
            optionValues: z.array(z.string()),
          }),
        ),
        quantity: z.number().int().positive().max(50),
        note: z.string().max(280).default(""),
        amountQirsh: z.number().int().nonnegative().max(50_000_000),
      }),
    )
    .min(1)
    .max(50),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
