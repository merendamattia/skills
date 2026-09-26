import { Queue } from "bullmq";
import Redis from "ioredis";
import { config } from "./config.ts";

export const APP_JOB_QUEUE = `production-webapp-${config.APP_ENV}-jobs`;
export const queueRedis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });

export const appJobQueue = new Queue<{ appJobId: string }>(APP_JOB_QUEUE, {
  connection: queueRedis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: 1_000,
    removeOnFail: 1_000,
  },
});
