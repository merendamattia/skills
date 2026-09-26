# syntax=docker/dockerfile:1
FROM oven/bun:1.3.14 AS dependencies
WORKDIR /app
COPY package.json bun.lock ./
COPY src/backend/package.json src/backend/package.json
COPY src/frontend/package.json src/frontend/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --frozen-lockfile

FROM dependencies AS development
COPY src/backend src/backend
COPY src/frontend src/frontend
RUN bun run --cwd src/backend db:generate

FROM development AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:17421
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN bun run --cwd src/frontend build

FROM oven/bun:1.3.14 AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json /app/bun.lock ./
COPY --from=build /app/src/backend/package.json src/backend/package.json
COPY --from=build /app/src/frontend/package.json src/frontend/package.json
RUN --mount=type=cache,target=/root/.bun/install/cache bun install --production --frozen-lockfile
COPY --from=build /app/src/backend/prisma src/backend/prisma
COPY --from=build /app/src/backend/prisma.config.ts src/backend/prisma.config.ts
COPY --from=build /app/src/backend/src src/backend/src
COPY --from=build /app/src/frontend/.next src/frontend/.next
COPY --from=build /app/src/frontend/next.config.ts src/frontend/next.config.ts
RUN bun run --cwd src/backend db:generate
WORKDIR /app/src/backend
EXPOSE 17420 17421
CMD ["bun", "run", "start"]
