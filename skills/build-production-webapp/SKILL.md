---
name: build-production-webapp
description: Build, extend, or review production full-stack web applications using the LocalRise-derived Bun, Next.js App Router, React, Hono RPC, Zod, Prisma PostgreSQL, Better Auth, BullMQ, Redis, TanStack Query, shadcn/ui, Docker Compose, GitHub Actions, pre-commit, and Conventional Commits architecture. Use for English or Italian requests such as "build a web app", "create a full-stack app", "creami una web app", project scaffolding, backend/frontend architecture, authentication, database design, caching, asynchronous jobs or workers, CI/CD, Docker, or production-readiness work. Enforce durable database-first queue handoff and worker-only execution for every operation modeled as a job or run.
---

# Build Production Web App

Build the smallest production-ready application that satisfies the brief. Reuse an existing
project before copying the starter. Treat the current repository as authority when extending it.

## Start every task

1. Read the product brief, repository instructions, manifests, schema, entrypoints, tests,
   Docker files, and workflows before proposing changes.
2. Write concrete acceptance criteria. Identify trust boundaries, durable data, synchronous
   CRUD, and operations that are jobs or runs.
3. Apply the Ponytail ladder: existing code, standard library, native platform, installed
   dependency, then minimum new code. Do not remove validation, security, accessibility, or
   failure handling.
4. Use TDD for non-trivial behavior. Prefer one decisive test over speculative suites.
5. Use the integrated guidance in [references/skills.md](references/skills.md); it is self-contained and does not depend on separately installing specialist skills. Check the linked upstream documentation when a version-sensitive detail needs confirmation.
6. For frontend work, inventory existing visual patterns before editing. Extend one canonical
   reusable component for each pattern instead of styling equivalent markup in pages or routes.

## Select references

- Read [references/architecture.md](references/architecture.md) for project structure,
  dependency direction, and vertical slices.
- Read [references/async-jobs.md](references/async-jobs.md) before creating or changing a job,
  run, queue, worker, retry, cancellation, or scheduler.
- Read [references/codex-workers.md](references/codex-workers.md) when a job delegates repository
  work to Codex or another coding agent.
- Read [references/backend-data.md](references/backend-data.md) for Hono, Zod, Prisma,
  PostgreSQL, Redis, caching, and migrations.
- Read [references/auth-security.md](references/auth-security.md) for Better Auth, authorization,
  uploads, audit, secrets, and other trust boundaries.
- Read [references/frontend.md](references/frontend.md) for Next.js, React, TanStack Query,
  shadcn/ui, UX, and accessibility. Read [references/react-performance.md](references/react-performance.md)
  for React and Next.js performance work.
- Read [references/operations.md](references/operations.md) for Bun, Docker, CI, hooks,
  releases, and validation. Read [references/conventional-commits.md](references/conventional-commits.md)
  before preparing commits or pull requests.

## Create a new application

1. Copy `assets/starter/` into the empty target directory.
2. Replace `production-webapp`, `production-webapp-backend`, `production-webapp-frontend`,
   display names, cache prefixes, and queue prefixes with product-specific values. Allocate
   ports from one documented, sequential project block and give every listening service a unique
   port; never reuse a port already assigned in the repository.
3. Keep the root Bun workspace and one root `bun.lock`. Do not add Nx or Turborepo.
4. Remove the example `Item` and `AppJob` vertical slices only after the product has equivalent
   synchronous and asynchronous slices. Never retain dead demo features.
5. Run `bun install` only when changing dependencies; otherwise use
   `bun install --frozen-lockfile`.
6. Create versioned Prisma migrations. Never use `prisma db push` for shared or production data.
7. Implement one vertical slice at a time: schema, repository, service only when orchestration
   exists, route, typed client hook, page, test.
8. Adapt PRODUCT.md and DESIGN.md to the actual subject. Do not reuse LocalRise branding.

## Ports and Docker contract

Maintain a port ledger in `.env.example` and the deployment documentation. Reserve the next
unused sequential block for the application (for example `17420`, `17421`, `17422`, ...), assign
one port per listening service, and keep local host ports, container ports, and production proxy
targets explicit. Do not use shared defaults such as `80`, `3000`, or `8080` for application
services when they collide with another service. Workers and other processes that do not listen
on a network port must declare no port instead of consuming one. Private infrastructure may keep
its protocol-native container port, but its published host port must be unique and documented.

Before finishing, inspect both resolved Compose files and verify the ledger matches every
`ports`, `expose`, `PORT`, healthcheck URL, Docker `EXPOSE`, and public service target. A Compose
configuration that resolves is necessary but not sufficient: duplicate or undocumented service
ports are a configuration error.

Every application has one shared `Dockerfile`. Keep production and local concerns in stages or
Compose commands when needed: the production Compose may select a runtime target, while the
local Compose may select a development target or mount source and run watch commands. The shared
file must use Bun for application install/build/runtime paths, use a frozen lockfile, and keep the
production runtime minimal and free of development servers. Both Compose files reference this
same `Dockerfile`; if a service is not containerized locally, its documented local command must
still run through Bun.

## Docker Compose contract

Always create two standalone Compose files:

1. `docker-compose.yaml` is the zero-dependency local stack. Include the application and every
   infrastructure service it actually uses, such as PostgreSQL, Redis, queues, or object storage,
   with health checks, persistent volumes, loopback-bound ports, and service-host URLs. A plain
   `docker compose up --build` must start a working local environment.
2. `docker-compose.production.yaml` contains only deployable application processes. Do not define
   PostgreSQL, Redis, or other infrastructure provisioned separately on the VPS/platform. Require
   their connection URLs through production environment variables and fail fast when missing.

Keep both files independently runnable; do not make production an override of the local file.
Document the exact local and production commands and test both resolved service graphs.

## Local Bun contract

Local development is Bun-first and must be complete without npm, yarn, or pnpm:

- Pin `packageManager` and commit one root `bun.lock` per workspace.
- Provide root `bun run dev`, `bun run test`, `bun run build`, `bun run lint`, and
  `bun run typecheck` commands, or document the equivalent `bun run --cwd` commands for each
  standalone service.
- Use `bun install --frozen-lockfile` in the shared Dockerfile and CI; use `bun run` for servers,
  workers, migrations, tests, and builds.
- Verify the local path from a clean checkout: install, start, healthcheck, test, and build with
  Bun. Production-only tooling may use its own installer inside the production image, but it
  must not be required to run the local application.

## Non-negotiable job contract

For every job or run, including mock providers:

1. Validate the request.
2. Create a PostgreSQL row as `PENDING`.
3. Persist `QUEUED`, `queuedAt`, and a stable `queueJobId` equal to the database ID.
4. Enqueue BullMQ with that same ID.
5. If enqueueing fails, persist `FAILED` and return the error. Never execute inline.
6. Let workers alone claim, run, heartbeat, retry, cancel, stale, and complete jobs.
7. Use conditional state transitions so duplicate delivery returns `IGNORED`.

Redis is required for BullMQ. Application cache entries must remain reconstructible from
PostgreSQL; cache errors become misses/no-ops, never data loss.

## Finish every task

Run targeted checks first, then every relevant repository workflow command. Inspect both
Dockerfiles, the port ledger, resolved Compose graphs, and the local Bun path. Preserve unrelated
changes, and create one coherent Conventional Commit at a time only when the user authorized
commits. Validate each exact commit message before committing and verify it after.

Do not add OAuth, 2FA, public registration, object storage, browser E2E, Kubernetes, Terraform,
or external observability until the product has a concrete requirement.

Before delivery, check behavior at trust boundaries, database migrations, authentication and
authorization, worker failure paths, keyboard and screen-reader access, local startup, production
image/Compose configuration, and the validation commands relevant to the changed code. Report
checks that could not run and the reason; never imply a production deployment occurred.
