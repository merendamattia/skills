# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14 AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
COPY CHANGELOG.md CHANGELOG.md
COPY src/backend/package.json src/backend/package.json
COPY src/frontend/package.json src/frontend/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM dependencies AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:17421
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY src/backend src/backend
RUN bun run --cwd src/backend db:generate
COPY src/frontend src/frontend
RUN bun run --cwd src/frontend build

FROM build AS runtime
WORKDIR /app/src/backend
EXPOSE 17420 17421
CMD ["bun", "run", "start"]
