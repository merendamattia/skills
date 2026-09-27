# Production web app agent instructions

## Task continuity

Read `.agent-todo.md` at the start of each task. Append every new user request, including later
corrections, with its requirements, constraints, status, decisions, completed work, blockers, and
next action. Update the file as work progresses and before handing off or switching models. It is
ignored by Git; never commit it or write credentials or secrets to it.

## Asynchronous jobs

Every operation modeled as a job or run, including mocks, must execute asynchronously. The HTTP
path validates, creates `PENDING`, persists `QUEUED` with a stable queue ID equal to the database
ID, enqueues BullMQ, and returns `202`. Workers alone move jobs through `RUNNING` and terminal
states. If enqueueing fails, persist `FAILED`; never execute inline.

Persist database state before queue handoff. Tests for every job type must assert the row is
`QUEUED` inside the enqueue callback and that worker processing completes it.

## Architecture

The browser talks only to Hono HTTP. Prisma lives behind repositories. Services coordinate domain
rules, cache invalidation, and queues. PostgreSQL is authoritative. Redis cache failures become
misses, but BullMQ requires Redis. Validate untrusted input with Zod and authorize in the backend.

## Validation and commits

Run targeted tests, then typecheck, lint, relevant tests, build, smoke, image build, and cross-service
checks. Create one coherent Conventional Commit with a body describing problem, implementation,
and validation. Validate the exact message with `conventional-pre-commit` before committing.
