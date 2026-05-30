import { z } from "zod";

import { FULFILLMENT_MODES } from "@/lib/ordering/fulfillment";

const fulfillmentEnum = z.enum(
  FULFILLMENT_MODES as unknown as [string, ...string[]],
);

export const assistantQuerySchema = z.object({
  query: z.string().min(2).max(500),
  fulfillmentMode: fulfillmentEnum.default("pickup"),
  locationSlug: z.string().max(100).nullable().optional(),
  /** Free-form dietary preferences captured by the allergen filter. */
  dietaryPreferences: z
    .array(
      z.enum(["vegan", "vegetarian", "gluten-free", "dairy-free"] as const),
    )
    .max(5)
    .default([]),
});

export type AssistantQueryInput = z.infer<typeof assistantQuerySchema>;
