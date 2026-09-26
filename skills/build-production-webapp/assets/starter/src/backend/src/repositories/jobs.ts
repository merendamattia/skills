import { AppJobStatus, type Prisma } from "@prisma/client";
import { prisma } from "../core/db.ts";
import { jobWhere, type JobScope } from "../schemas/jobs.ts";

const active = [AppJobStatus.RUNNING];
const cancellable = [
  AppJobStatus.PENDING,
  AppJobStatus.QUEUED,
  AppJobStatus.RETRYING,
  AppJobStatus.RUNNING,
];

export const jobRepository = {
  createPending: (userId: string, environment: string, input: Prisma.InputJsonValue) =>
    prisma.appJob.create({ data: { userId, environment, input } }),

  markQueued: (id: string, queueJobId: string) => prisma.appJob.update({
    where: { id },
    data: { status: AppJobStatus.QUEUED, queueJobId, queuedAt: new Date(), errorMessage: null },
  }),

  failEnqueue: (id: string, errorMessage: string) => prisma.appJob.updateMany({
    where: { id, status: { in: [AppJobStatus.PENDING, AppJobStatus.QUEUED] } },
    data: { status: AppJobStatus.FAILED, errorMessage: errorMessage.slice(0, 2_000), failedAt: new Date() },
  }),

  claim: async (id: string, environment: string, workerId: string) => {
    const now = new Date();
    const claimed = await prisma.appJob.updateMany({
      where: { id, environment, status: { in: [AppJobStatus.QUEUED, AppJobStatus.RETRYING] } },
      data: {
        status: AppJobStatus.RUNNING,
        workerId,
        attempts: { increment: 1 },
        startedAt: now,
        heartbeatAt: now,
        failedAt: null,
        errorMessage: null,
      },
    });
    if (claimed.count !== 1) return null;
    return prisma.appJob.findUnique({ where: { id } });
  },

  heartbeat: (id: string) => prisma.appJob.updateMany({
    where: { id, status: { in: active } },
    data: { heartbeatAt: new Date() },
  }),

  complete: (id: string, result: Prisma.InputJsonValue) => prisma.appJob.updateMany({
    where: { id, status: AppJobStatus.RUNNING },
    data: {
      status: AppJobStatus.COMPLETED,
      result,
      completedAt: new Date(),
      heartbeatAt: new Date(),
      errorMessage: null,
    },
  }),

  failAttempt: (id: string, message: string, final: boolean) => prisma.appJob.updateMany({
    where: { id, status: AppJobStatus.RUNNING },
    data: {
      status: final ? AppJobStatus.FAILED : AppJobStatus.RETRYING,
      errorMessage: message.slice(0, 2_000),
      failedAt: final ? new Date() : null,
      heartbeatAt: new Date(),
    },
  }),

  cancel: (id: string, scope: JobScope) => prisma.appJob.updateMany({
    where: { id, ...jobWhere(scope), status: { in: cancellable } },
    data: { status: AppJobStatus.CANCELLED, completedAt: new Date(), errorMessage: null },
  }),

  list: (scope: JobScope) => prisma.appJob.findMany({
    where: jobWhere(scope),
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, username: true, displayUsername: true } } },
  }),

  findVisible: (id: string, scope: JobScope) => prisma.appJob.findFirst({
    where: { id, ...jobWhere(scope) },
    include: { user: { select: { id: true, username: true, displayUsername: true } } },
  }),

  markStale: async (environment: string, staleBefore: Date) => {
    const result = await prisma.appJob.updateMany({
      where: { environment, status: AppJobStatus.RUNNING, heartbeatAt: { lt: staleBefore } },
      data: { status: AppJobStatus.STALE, errorMessage: "Worker heartbeat expired", failedAt: new Date() },
    });
    return result.count;
  },

  counts: (scope: JobScope) => prisma.appJob.groupBy({
    by: ["status"],
    where: jobWhere(scope),
    _count: { _all: true },
  }),
};
