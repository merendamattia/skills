# Production Web App Starter

An adaptable Bun workspace with a Next.js frontend, a Hono API, PostgreSQL, Better Auth, Redis, and a separate BullMQ worker. Replace the example product name, ports, data models, jobs, and UI with the real product before shipping.

## Run locally with Docker

Requirements: Docker Engine with Compose. The default credentials and ports are for local development only.

```sh
docker compose up --build -d
docker compose ps
```

The backend applies the included Prisma migration and creates the first administrator if the user table is empty. Sign in with `admin` / `local-only-admin-password`. Copy `.env.example` to `.env` to change local values; `.env` is ignored by Git.

| Service | Local address |
| --- | --- |
| Frontend | <http://localhost:17420> |
| API health | <http://localhost:17421/api/health> |
| PostgreSQL | `localhost:17422` |
| Redis | `localhost:17423` |

For host-based development, start only the infrastructure, then run Bun in the workspace:

```sh
cp .env.example .env
docker compose up -d postgres redis
bun install --frozen-lockfile
bun run db:generate
bun run db:deploy
bun run dev
```

## Run isolated local tests

The test environment uses a different Compose project, database, Redis instance, and host port block. Keep production and development data out of test runs.

```sh
cp .env.test.example .env.test
docker compose --env-file .env.test up -d postgres redis
bun --env-file=.env.test run db:generate
bun --env-file=.env.test run db:deploy
bun --env-file=.env.test run test
docker compose --env-file .env.test down
```

The integration suite runs when `RUN_INTEGRATION=1`, as in `.env.test.example`. It checks the PostgreSQL to BullMQ handoff and worker state transitions. `docker compose down` keeps the test volumes; use `down -v` only when you intend to discard their data.

## Production

Production Compose runs only the application processes. Provision PostgreSQL and Redis separately and provide their private connection URLs. Copy `.env.production.example` to `.env.production`, set every blank required value, and provide a random Better Auth secret and a strong administrator password.

```sh
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yaml config --quiet
docker compose --env-file .env.production -f docker-compose.production.yaml up --build -d
```

Publish the frontend and backend through your reverse proxy to the `17420` and `17421` container ports. Set `FRONTEND_URL` and `PUBLIC_API_URL` to their public HTTPS origins before building; the frontend API URL is embedded at build time. Keep the worker private. The production image installs runtime dependencies, generates the Prisma client, and runs migrations when the backend starts.

## Delivery

The included GitHub Actions check Bun types, lint, tests, build, Docker images and Compose, and Conventional Commits. A main-branch release workflow creates release notes and updates `CHANGELOG.md`. Configure repository write permissions for Actions; use a token with permission to push release commits if the branch is protected.

See the parent skill's [architecture](../../references/architecture.md), [async jobs](../../references/async-jobs.md), [authentication](../../references/auth-security.md), and [operations](../../references/operations.md) guides when adapting this starter.
