import { expect, test } from "bun:test";

const integrationTest = process.env.RUN_INTEGRATION === "1" ? test : test.skip;

integrationTest("persists queue handoff before worker execution and guards terminal states", async () => {
  const [{ prisma }, queue, jobs, { jobRepository }] = await Promise.all([
    import("../src/core/db.ts"),
    import("../src/core/queue.ts"),
    import("../src/services/jobs.ts"),
    import("../src/repositories/jobs.ts"),
  ]);
  const suffix = crypto.randomUUID();
  const userId = `job-test-${suffix}`;
  const createdJobIds: string[] = [];
  await prisma.user.create({
    data: {
      id: userId,
      name: "Job Test User",
      email: `${suffix}@example.test`,
      username: `job-${suffix}`,
    },
  });

  try {
    let handlerCalled = false;
    let stateDuringEnqueue = "";
    const queued = await jobs.createAppJob(userId, { message: "Build report" }, async (id) => {
      stateDuringEnqueue = (await prisma.appJob.findUniqueOrThrow({ where: { id } })).status;
    });
    createdJobIds.push(queued.id);
    expect(stateDuringEnqueue).toBe("QUEUED");
    expect(queued.queueJobId).toBe(queued.id);
    expect(queued.status).toBe("QUEUED");
    expect(handlerCalled).toBe(false);

    expect(await jobs.processAppJob(queued.id, async (input) => {
      handlerCalled = true;
      return { echoed: input };
    })).toBe("COMPLETED");
    expect(handlerCalled).toBe(true);
    expect((await prisma.appJob.findUniqueOrThrow({ where: { id: queued.id } })).status)
      .toBe("COMPLETED");
    expect(await jobs.processAppJob(queued.id)).toBe("IGNORED");

    const pendingFailure = await jobRepository.createPending(userId, "test", { message: "Fail" });
    createdJobIds.push(pendingFailure.id);
    let failureStateDuringEnqueue = "";
    await expect(jobs.enqueueAppJob(pendingFailure, async (id) => {
      failureStateDuringEnqueue = (await prisma.appJob.findUniqueOrThrow({ where: { id } })).status;
      throw new Error("Redis unavailable");
    })).rejects.toThrow("Redis unavailable");
    expect(failureStateDuringEnqueue).toBe("QUEUED");
    expect((await prisma.appJob.findUniqueOrThrow({ where: { id: pendingFailure.id } })).status)
      .toBe("FAILED");

    const cancellable = await jobs.createAppJob(userId, { message: "Cancel" }, async () => {});
    createdJobIds.push(cancellable.id);
    await jobs.cancelAppJob(cancellable.id, { userId, isAdmin: false });
    expect(await jobs.processAppJob(cancellable.id)).toBe("IGNORED");

    const stale = await jobs.createAppJob(userId, { message: "Stale" }, async () => {});
    createdJobIds.push(stale.id);
    await jobRepository.claim(stale.id, "test", "dead-worker");
    await prisma.appJob.update({
      where: { id: stale.id },
      data: { heartbeatAt: new Date(Date.now() - 120_000) },
    });
    expect(await jobs.markStaleJobs()).toBeGreaterThanOrEqual(1);
    expect((await prisma.appJob.findUniqueOrThrow({ where: { id: stale.id } })).status)
      .toBe("STALE");
  } finally {
    await prisma.appJob.deleteMany({ where: { id: { in: createdJobIds } } });
    await prisma.user.delete({ where: { id: userId } });
    await Promise.all([queue.appJobQueue.close(), prisma.$disconnect()]);
    queue.queueRedis.disconnect();
  }
});
