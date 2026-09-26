import { prisma } from "../core/db.ts";
import { cacheGet, cacheSet } from "../core/redis.ts";
import { jobRepository } from "../repositories/jobs.ts";
import type { JobScope } from "../schemas/jobs.ts";

export async function getDashboard(scope: JobScope) {
  const cacheKey = `dashboard:${scope.isAdmin ? "admin" : scope.userId}`;
  const cached = await cacheGet<Awaited<ReturnType<typeof readDashboard>>>(cacheKey);
  if (cached) return cached;
  const dashboard = await readDashboard(scope);
  await cacheSet(cacheKey, dashboard, 10);
  return dashboard;
}

async function readDashboard(scope: JobScope) {
  const [items, jobs] = await Promise.all([
    prisma.item.count({ where: scope.isAdmin ? {} : { userId: scope.userId } }),
    jobRepository.counts(scope),
  ]);
  return {
    items,
    jobs: Object.fromEntries(jobs.map((row) => [row.status, row._count._all])),
  };
}
