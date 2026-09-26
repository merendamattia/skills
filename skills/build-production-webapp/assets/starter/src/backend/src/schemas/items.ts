import { z } from "zod";

export const createItemSchema = z.object({ name: z.string().trim().min(1).max(100) });
export const updateItemSchema = createItemSchema.partial();
