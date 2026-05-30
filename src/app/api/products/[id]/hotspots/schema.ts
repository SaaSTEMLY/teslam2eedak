import { z } from "zod";

const hotspot = z.object({
  locale: z.enum(["en", "ar", "es"]),
  menuImageId: z.string().min(1),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0.02).max(1),
  h: z.number().min(0.02).max(1),
});

export const updateHotspotsSchema = z.object({
  hotspotBoxes: z.array(hotspot).max(50),
});

export type UpdateHotspotsInput = z.infer<typeof updateHotspotsSchema>;
