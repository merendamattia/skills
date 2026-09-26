# Build Production Web App

One installable agent skill for building, extending, and reviewing production web applications. It brings together practical guidance for frontend design, React performance, backend architecture, authentication, durable jobs, Docker, and delivery. A Bun workspace starter is included for new projects.

## Install

Install globally with the [Skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add merendamattia/skills -g
```

The repository contains one skill, `build-production-webapp`. The CLI detects your available agents and lets you choose where to install it. To select Claude Code, Codex, and OpenCode explicitly:

```sh
npx skills add merendamattia/skills -g -a claude-code -a codex -a opencode
```

Omit `-g` to install in the current project. The skill uses the standard `SKILL.md` format, so the same instructions work with any agent supported by the Skills CLI. `agents/openai.yaml` adds optional Codex presentation metadata; it is not needed by other agents.

## Use it

Ask your agent to use `build-production-webapp` when creating a new app or changing an existing one. For example:

> Use build-production-webapp to create a customer portal with email sign-in, an admin area, and background report generation.

The skill starts with the product requirements and existing code, then reads only the references relevant to the task. For a new app, it can adapt the included starter. The starter provides:

| Area | Included |
| --- | --- |
| Frontend | Next.js App Router, React, TanStack Query, shadcn/ui |
| API and data | Hono RPC, Zod, Prisma, PostgreSQL |
| Identity | Better Auth, admin bootstrap, protected routes |
| Background work | PostgreSQL-backed job state, BullMQ, Redis, separate worker process |
| Delivery | Bun workspace, local and production Docker Compose, GitHub Actions, Conventional Commits |

Codex-driven repository work has a dedicated [worker guide](skills/build-production-webapp/references/codex-workers.md). The starter's default worker demonstrates durable job handling; a product that needs Codex execution adds its chosen Codex runtime, credentials, and isolated workspace using that guide.

## Update

After a new version is pushed to GitHub, update the global installation with:

```sh
npx skills update -g build-production-webapp
```

For a project installation, use `npx skills update -p build-production-webapp` inside that project. The Skills CLI tracks the source and checks the installed skill against the current GitHub tree. GitHub Releases provide a versioned history; installation and updates read the repository directly, without an npm package.

## Repository layout

```text
skills/build-production-webapp/
  SKILL.md             Entry point and workflow
  references/          Focused guides, including source-skill integration
  assets/starter/      Adaptable full-stack application
  agents/openai.yaml   Optional Codex metadata
```

The [source map](skills/build-production-webapp/references/skills.md) identifies the upstream skills and documentation reflected in the guides. They are reference material, not additional installation requirements. The starter has its own [setup guide](skills/build-production-webapp/assets/starter/README.md) and GitHub Actions, which become active when the starter is copied into a new repository. This repository's workflow validates installation and the starter before creating a release from Conventional Commits.
