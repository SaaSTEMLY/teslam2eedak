import { z } from "zod";

import { PAYMENT_STATUSES } from "@/lib/ordering/payment-status";

export const updatePaymentStatusSchema = z.object({
  to: z.enum(PAYMENT_STATUSES as unknown as [string, ...string[]]),
  reason: z.string().max(280).optional(),
});

export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusSchema
>;
