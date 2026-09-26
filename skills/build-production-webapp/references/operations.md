# Operations and Delivery

## Bun

Use one root `bun.lock`, commit it, and pin `packageManager`. Use Bun for install, TypeScript
runtime, tests, and builds. CI and Docker run `bun install --frozen-lockfile`. Add dependencies with
`bun add`; do not edit lockfiles manually. Allow lifecycle scripts only through reviewed
`trustedDependencies`. Local development must run entirely through Bun; npm, yarn, and pnpm may
not be required by local scripts, Compose commands, or development Dockerfiles.

Validation order:

1. specific changed-component test;
2. typecheck and lint;
3. relevant unit/integration tests;
4. build;
5. direct startup/smoke;
6. changed image build;
7. cross-service checks;
8. full Compose only for networking, volumes, images, or end-to-end flows.

## Docker and environments

Reserve a documented sequential port block for the project and assign a unique port to every
listening application service. Record local host ports, container ports, `PORT`, `EXPOSE`,
`expose`, healthcheck URLs, and production proxy targets in the same ledger. Never silently reuse
an existing port or fall back to shared application defaults such as `80`, `3000`, or `8080`.
Processes without a listener do not get a dummy port. Validate the ledger against both resolved
Compose files before delivery.

Maintain one shared `Dockerfile`, using stages or Compose commands for production and local
behavior. Production Compose may select a minimal runtime target; local Compose may select a
development target or mount source and run watch-friendly Bun commands. Both graphs reference
the same Dockerfile and must be independently runnable.

Use multi-stage builds and health checks. Always maintain two independently runnable files:

- `docker-compose.yaml`: complete local stack. Include every infrastructure dependency the app
  actually uses (for example PostgreSQL, Redis, queues, or object storage), persistent volumes,
  health checks, loopback-bound host ports, and application `depends_on` health conditions. Use
  Docker service names in internal URLs. `docker compose up --build` must work without separately
  installing or starting those dependencies.
- `docker-compose.production.yaml`: application processes only. Exclude PostgreSQL, Redis, and
  other resources provisioned separately on the VPS or deployment platform. Read their URLs and
  credentials from required environment variables; never point a production container at
  `127.0.0.1` for an external resource.

Do not implement production as an override that depends on loading the local Compose file. Verify
the service graphs independently with `docker compose config --services` and
`docker compose -f docker-compose.production.yaml config --services`. Backend applies
`prisma migrate deploy` before startup. Frontend public API URLs are build-time values and require
rebuild after change.

Namespace queues, cache keys, database test data, and volumes by `APP_ENV`. Test runs explicitly
set test environment and mock providers when providers exist. Never let a developer `.env` alter
the test contract.

## GitHub Actions

Keep separate checks for application quality, Docker/Compose, Conventional Commits/pre-commit,
and semantic release. Integration CI uses real PostgreSQL and Redis services and applies migrations
before tests. Auto-assign configuration must not hardcode a copied repository owner.

Semantic Release and auto-assignment require GitHub events/secrets; do not simulate a release
locally or claim those workflows passed before push.

## Commits

Read [conventional-commits.md](conventional-commits.md) for commit, staging, message, and pull
request rules. It is the source of truth for this workflow. Make a commit only when the user asks.
