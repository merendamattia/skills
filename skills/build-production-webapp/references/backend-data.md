# Backend, PostgreSQL, and Redis

## Hono and Zod

Create one Hono app with `/api`, request IDs, secure headers, exact-origin credentialed CORS,
audit middleware, Better Auth wildcard routes, centralized errors, JSON 404, health, then chained
feature routes. Validate JSON, query, param, form, and upload limits at the boundary.

```ts
const routes = app
  .get("/health", (c) => c.json({ status: "ok" as const }))
  .route("/items", itemRoutes)
  .route("/jobs", jobRoutes);
export type AppType = typeof routes;
```

## Prisma and PostgreSQL

Use Prisma's PostgreSQL driver adapter and cache the development client in `globalThis` to avoid
hot-reload connection multiplication. Keep CLI URL configuration in `prisma.config.ts`.

- Choose decimal precision deliberately for money and measurement.
- Normalize date-only values consistently.
- Add foreign-key indexes and indexes matching filters/order.
- Use unique constraints for natural idempotency keys.
- Prefer transactions for state transitions affecting multiple records.
- Use cascade only when child history has no independent value; otherwise restrict or soft-delete.
- Generate migrations with `prisma migrate dev`; deploy with `prisma migrate deploy`.
- Make bootstrap/seed idempotent. Never create the initial admin twice.

Repositories own Prisma. A service may use `prisma.$transaction` only as an explicit transaction
orchestration boundary; keep individual queries in repositories when practical.

## Redis cache

Use a separate ioredis client from BullMQ. Prefix keys with application and environment. Cache
JSON with explicit TTL near the consuming service.

```ts
const cached = await cacheGet<Result>(key);
if (cached) return cached;
const result = await repository.compute();
await cacheSet(key, result, 60);
return result;
```

Required properties:

1. deterministic namespaced key;
2. PostgreSQL/provider reconstruction path;
3. declared TTL;
4. mutation/worker invalidation;
5. safe miss/no-op on cache failure;
6. `SCAN`, never blocking `KEYS`, for wildcard invalidation.

Redis cache availability is optional for read correctness. Redis itself is operationally required
when BullMQ is enabled; do not claim the application can run jobs without it.
