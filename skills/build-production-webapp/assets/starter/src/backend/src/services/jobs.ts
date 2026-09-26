import type { Prisma } from "@prisma/client";
import { config } from "../core/config.ts";
import { AppError, NotFoundError } from "../core/errors.ts";
import { appJobQueue } from "../core/queue.ts";
import { cacheInvalidate } from "../core/redis.ts";
import { jobRepository } from "../repositories/jobs.ts";
import type { JobScope } from "../schemas/jobs.ts";

type AddToQueue = (id: string) => Promise<unknown>;
const addToQueue: AddToQueue = (id) =>
  appJobQueue.add("execute", { appJobId: id }, { jobId: id });

export async function enqueueAppJob(job: { id: string }, add: AddToQueue = addToQueue) {
  try {
    const queued = await jobRepository.markQueued(job.id, job.id);
    await add(job.id);
    return queued;
  } catch (error) {
    await jobRepository.failEnqueue(job.id, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

export async function createAppJob(userId: string, input: Prisma.InputJsonValue, add?: AddToQueue) {
  const job = await jobRepository.createPending(userId, config.APP_ENV, input);
  const queued = await enqueueAppJob(job, add);
  await cacheInvalidate(`dashboard:${userId}`);
  return queued;
}

export async function getAppJob(id: string, scope: JobScope) {
  const job = await jobRepository.findVisible(id, scope);
  if (!job) throw new NotFoundError("Job not found");
  return job;
}

export async function cancelAppJob(id: string, scope: JobScope) {
  await getAppJob(id, scope);
  const cancelled = await jobRepository.cancel(id, scope);
  if (!cancelled.count) throw new AppError(409, "Job is no longer cancellable");
  await appJobQueue.remove(id).catch(() => 0);
  await cacheInvalidate(`dashboard:${scope.userId}`);
  return getAppJob(id, scope);
}

export type JobHandler = (input: Prisma.JsonValue) => Promise<Prisma.InputJsonValue>;
const exampleHandler: JobHandler = async (input) => {
  await Bun.sleep(25);
  return { processed: input, processedAt: new Date().toISOString() };
};

export async function processAppJob(id: string, handler: JobHandler = exampleHandler) {
  const job = await jobRepository.claim(id, config.APP_ENV, config.WORKER_ID);
  if (!job) return "IGNORED" as const;
  const timer = setInterval(() => void jobRepository.heartbeat(id), config.HEARTBEAT_INTERVAL);
  try {
    const result = await handler(job.input);
    const completed = await jobRepository.complete(id, result);
    await cacheInvalidate(`dashboard:${job.userId}`);
    return completed.count ? "COMPLETED" as const : "CANCELLED" as const;
  } finally {
    clearInterval(timer);
  }
}

export const markStaleJobs = () => jobRepository.markStale(
  config.APP_ENV,
  new Date(Date.now() - config.STALE_JOB_THRESHOLD),
);
