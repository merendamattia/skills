# Architecture

## Contents

1. Invariants
2. Dependency flow
3. Monorepo
4. Vertical slices
5. Configuration and errors

## Invariants

- The browser talks only to the HTTP API.
- The backend alone owns PostgreSQL, Redis, queues, files, and external providers.
- PostgreSQL is authoritative. Redis contains BullMQ state or reconstructible cache data.
- HTTP boundaries validate untrusted input with Zod.
- Hono exports `AppType`; the frontend derives request and response types without OpenAPI codegen.
- Every job/run is asynchronous. Short local CRUD can remain synchronous.
- Use versioned Prisma migrations and idempotent bootstrap/seed logic.

## Dependency flow

```text
Next page/component -> TanStack hook -> Hono RPC client -> HTTP
HTTP route -> service/orchestrator -> repository -> Prisma -> PostgreSQL
                              |-> cache adapter -> Redis
                              `-> queue producer -> BullMQ -> worker -> repository/provider
```

Routes perform transport, validation, authorization, delegation, and status selection. Services
exist for domain rules, transactions across repositories, cache invalidation, or queue handoff.
Repositories contain Prisma queries. Workers own execution. Providers isolate external APIs.
Utilities are pure. Do not add controller classes, factories, or one-implementation interfaces.

## Monorepo

```text
src/backend/{prisma,src/{api,core,repositories,schemas,services},test}
src/frontend/src/{app,components,hooks,lib}
```

Use Bun workspaces and one root lockfile. The frontend workspace depends on the backend workspace
only for exported Hono types. It must never import backend runtime modules, Prisma, or secrets.

## Vertical slices

Build the smallest files required for one behavior:

```text
schema -> repository -> optional service -> route -> typed hook -> surface -> test
```

Keep user/tenant scope in every repository query, not only in the UI. Derive Hono client types:

```ts
type Job = InferResponseType<typeof api.jobs[":id"]["$get"], 200>;
type CreateJob = InferRequestType<typeof api.jobs["$post"]>["json"];
```

Chain Hono routes before exporting `AppType`; unchained mounts weaken inference.

## Configuration and errors

Parse `process.env` once with Zod and fail startup on invalid values. Keep local/test/production
isolated through explicit environment names used in database rows, queues, and workspaces.

Use small HTTP error classes for expected 4xx failures. Central `onError` maps known errors,
logs an internal request ID, and returns a generic 500. Never return stack traces or secrets.
