import { Worker, type Job } from "bullmq";
import Redis from "ioredis";
import { config } from "./core/config.ts";
import { logger } from "./core/logger.ts";
import { APP_JOB_QUEUE, appJobQueue, queueRedis } from "./core/queue.ts";
import { jobRepository } from "./repositories/jobs.ts";
import { markStaleJobs, processAppJob } from "./services/jobs.ts";
import { heartbeat } from "./services/monitoring.ts";

await heartbeat("worker", { queue: APP_JOB_QUEUE });
await markStaleJobs();

const refreshHeartbeat = () => heartbeat("worker", { queue: APP_JOB_QUEUE });
setInterval(() => void refreshHeartbeat().catch((error) => {
  logger.error("Worker heartbeat failed", { error: String(error) });
}), config.HEARTBEAT_INTERVAL).unref();

const workerRedis = new Redis(config.REDIS_URL, { maxRetriesPerRequest: null });
const worker = new Worker<{ appJobId: string }>(APP_JOB_QUEUE, async (job: Job<{ appJobId: string }>) => {
  try {
    return await processAppJob(job.data.appJobId);
  } catch (error) {
    const final = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
    await jobRepository.failAttempt(job.data.appJobId, error instanceof Error ? error.message : String(error), final);
    throw error;
  }
}, { connection: workerRedis, concurrency: config.QUEUE_CONCURRENCY });

worker.on("completed", (job, status) => logger.info("Job completed", { jobId: job.id, status }));
worker.on("failed", (job, error) => logger.error("Job attempt failed", {
  jobId: job?.id,
  attemptsMade: job?.attemptsMade,
  error: error.message,
}));
worker.on("error", (error) => logger.error("Worker error", { error: error.message }));

setInterval(() => void markStaleJobs(), config.STALE_JOB_THRESHOLD).unref();
logger.info("Worker started", { queue: APP_JOB_QUEUE, concurrency: config.QUEUE_CONCURRENCY });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void Promise.all([worker.close(), appJobQueue.close()]).finally(() => {
    workerRedis.disconnect();
    queueRedis.disconnect();
    process.exit(0);
  }));
}
