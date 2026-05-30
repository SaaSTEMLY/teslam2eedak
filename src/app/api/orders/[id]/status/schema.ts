import { z } from "zod";

import { KITCHEN_STATUSES } from "@/lib/ordering/tracker";

export const updateStatusSchema = z.object({
  to: z.enum(KITCHEN_STATUSES as unknown as [string, ...string[]]),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
