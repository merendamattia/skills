# Asynchronous Jobs and BullMQ

## Contents

1. Mandatory handoff
2. State machine
3. Worker behavior
4. Retry, cancellation, and stale recovery
5. Tests and operations

## Mandatory handoff

Use the database ID as the stable BullMQ ID. Ordering is strict:

```ts
const job = await repository.createPending(input);
try {
  const queued = await repository.markQueued(job.id, job.id);
  await queue.add("execute", { appJobId: job.id }, { jobId: job.id });
  return queued;
} catch (error) {
  await repository.failEnqueue(job.id, String(error));
  throw error;
}
```

Never enqueue a row still marked `PENDING`: a fast worker can claim before persistence finishes.
Never call a provider or processor from the request. Return `202 Accepted` with the durable row.

## State machine

Recommended generic states:

```text
PENDING -> QUEUED -> RUNNING -> COMPLETED
                    |    `----> RETRYING -> RUNNING
                    `----------> FAILED
PENDING/QUEUED/RETRYING/RUNNING -> CANCELLED
RUNNING with expired heartbeat -> STALE
```

Persist queue ID, environment, worker ID, attempts, error, result, `queuedAt`, `startedAt`,
`heartbeatAt`, `completedAt`, and `failedAt`. Use `updateMany` with the expected current state for
claims and terminal transitions. One affected row means success; zero means duplicate delivery,
cancellation, deletion, or a race and returns `IGNORED`.

## Worker behavior

- Use a dedicated process and dedicated ioredis connection with `maxRetriesPerRequest: null`.
- Configure bounded concurrency from validated environment variables.
- Claim before reading execution data.
- Verify the persisted environment matches the worker.
- Increment attempts at claim time.
- Heartbeat active work more frequently than the stale threshold.
- Persist results and related durable data in one transaction before declaring completion.
- Log job ID, attempt, duration, and terminal state without payload secrets.
- On SIGINT/SIGTERM, close the BullMQ worker and Redis connection.

Mocks obey the same queue and worker path. Mocking changes only the execution provider.

## Retry, cancellation, and stale recovery

Let BullMQ own delay/backoff; let PostgreSQL own visible business state. After a failed attempt,
persist `RETRYING` unless it is final, then persist `FAILED`. Processors must be idempotent or use
unique constraints/upserts around side effects.

Cancellation is a conditional database transition plus best-effort queue removal. A running worker
must check guarded transitions before completion so cancelled work cannot overwrite the terminal
state. Add cooperative abort only when the provider supports it.

Mark claimed/running jobs `STALE` when heartbeat expires. Do not call an old job `FAILED` without
retaining the stale reason. Requeue or retry through a new explicit action when business semantics
require history.

The DB-before-queue sequence still has a process-crash window after `QUEUED` and before `add`.
Add an outbox/reconciler only when strict delivery or observed orphaning requires it; stable IDs
make safe re-enqueue possible.

## Tests and operations

Every job type must prove:

- the database row is `QUEUED` inside the enqueue callback;
- request/service returns before execution begins;
- enqueue failure persists `FAILED` and propagates the error;
- worker processing completes the job;
- duplicate delivery returns `IGNORED`;
- retry, cancellation, and stale guards cannot overwrite newer terminal states.

Namespace queues by application and environment. Monitor BullMQ counts alongside PostgreSQL
business states; they answer different questions.
