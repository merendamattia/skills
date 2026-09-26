import type { Prisma } from "@prisma/client";
import { config } from "../core/config.ts";
import { prisma } from "../core/db.ts";
import { appJobQueue } from "../core/queue.ts";

export async function heartbeat(serviceName: string, metadata?: Prisma.InputJsonValue) {
  await prisma.serviceHeartbeat.upsert({
    where: {
      serviceName_environment_instanceId: {
        serviceName,
        environment: config.APP_ENV,
        instanceId: config.WORKER_ID,
      },
    },
    create: { serviceName, environment: config.APP_ENV, instanceId: config.WORKER_ID, metadata },
    update: { lastSeenAt: new Date(), metadata },
  });
  if (serviceName === "worker") await Bun.write("/tmp/production-webapp-worker.heartbeat", new Date().toISOString());
}

export async function queueMonitor() {
  const [counts, workers] = await Promise.all([
    appJobQueue.getJobCounts("waiting", "active", "delayed", "completed", "failed", "paused"),
    prisma.serviceHeartbeat.findMany({
      where: { environment: config.APP_ENV },
      orderBy: { lastSeenAt: "desc" },
    }),
  ]);
  return { queue: { name: appJobQueue.name, counts }, workers };
}
