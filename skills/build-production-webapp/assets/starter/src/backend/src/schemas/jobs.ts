import { z } from "zod";

export const createJobSchema = z.object({
  message: z.string().trim().min(1).max(1_000),
});

export type JobScope = { userId: string; isAdmin: boolean };
export const jobWhere = (scope: JobScope) => scope.isAdmin ? {} : { userId: scope.userId };
