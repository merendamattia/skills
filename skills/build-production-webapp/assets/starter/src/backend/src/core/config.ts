import { z } from "zod";

const schema = z.object({
  APP_ENV: z.enum(["local", "test", "production"]).default("local"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  FRONTEND_URL: z.url(),
  ADMIN_USERNAME: z.string().min(3).max(30).regex(/^[A-Za-z0-9_.]+$/),
  ADMIN_PASSWORD: z.string().min(8).max(128),
  QUEUE_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(2),
  WORKER_ID: z.string().min(1).default("local-worker-1"),
  HEARTBEAT_INTERVAL: z.coerce.number().int().min(1_000).default(10_000),
  STALE_JOB_THRESHOLD: z.coerce.number().int().min(5_000).default(60_000),
  PORT: z.coerce.number().int().positive().default(17_421),
}).superRefine((value, context) => {
  if (value.HEARTBEAT_INTERVAL >= value.STALE_JOB_THRESHOLD) {
    context.addIssue({
      code: "custom",
      path: ["HEARTBEAT_INTERVAL"],
      message: "Heartbeat interval must be shorter than the stale threshold",
    });
  }
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration", z.treeifyError(parsed.error));
  throw new Error("Invalid environment configuration");
}

export const config = parsed.data;
