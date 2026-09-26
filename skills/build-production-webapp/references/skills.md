# Integrated skill sources

This skill is self-contained. The table records the source material behind its focused guidance; those repositories are not runtime dependencies and do not need separate installations. Read the relevant local reference first. Consult the upstream source when a library, framework, CLI, or design rule may have changed since the bundled guidance was reviewed.

| Capability | Requested source | Skill path or documentation | Integrated guidance |
| --- | --- | --- | --- |
| Find skills | `vercel-labs/skills` | `skills/find-skills/SKILL.md` | This repository's installation and update instructions |
| Frontend design | `anthropics/skills` | `skills/frontend-design/SKILL.md` | `frontend.md` |
| React performance | `vercel-labs/agent-skills` | `skills/react-best-practices/SKILL.md` (also called `vercel-react-best-practices`) | `react-performance.md` |
| Web interface guidelines | `vercel-labs/agent-skills` | `skills/web-design-guidelines/SKILL.md` | `frontend.md`; retrieve the current checklist for an explicit audit |
| Bun | `bun.sh` | `https://bun.sh/docs` | `operations.md` |
| Better Auth | `better-auth/skills` | `better-auth/best-practices/SKILL.md` | `auth-security.md` |
| Hono | `yusukebe/hono-skill` | `skills/hono/SKILL.md` | `backend-data.md`, `architecture.md` |
| Impeccable | `pbakaus/impeccable` | `.agents/skills/impeccable/SKILL.md` | `frontend.md` |
| shadcn/ui | `shadcn/ui` | `skills/shadcn/SKILL.md` | `frontend.md` |
| TanStack Query | `tanstack-skills/tanstack-skills` | `plugins/tanstack-query/skills/tanstack-query/SKILL.md` | `frontend.md` |
| SOLID and testing | `ramziddin/solid-skills` | `skills/solid/SKILL.md` | `architecture.md`, `operations.md` |
| Conventional Commits | `merendamattia/skills` | `skills/conventional-commits/SKILL.md` | `conventional-commits.md` |

## Routing

- For a new interface or a substantial redesign, use the product's real audience and purpose to choose its visual direction. Review `frontend.md`; avoid generic category-driven design and keep accessibility and responsive behavior in the implementation.
- For React/Next.js rendering, state, request waterfalls, or bundle size, read `react-performance.md`.
- For data fetching, caching, mutations, invalidation, or polling, read the TanStack Query section of `frontend.md` and check the installed major version's official docs.
- For authentication and session behavior, read `auth-security.md`. Check current Better Auth documentation before using version-sensitive APIs or plugins.
- For a durable coding-agent run, read `codex-workers.md`; keep agent orchestration separate from ordinary domain jobs.
- For API boundaries, middleware, validation, and typed RPC, read `backend-data.md`. Check the installed Hono version's official docs before relying on a changing API.
- For commit messages, staging, splitting work, or pull requests, read `conventional-commits.md`. Create commits or open pull requests only when requested.
- For a UI guideline audit, retrieve the live checklist at `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`, then report concrete findings by file and line. A bundled summary cannot replace the current checklist.
- Search skills only when this workflow lacks a capability that the task actually needs. Verify the source and inspect its contents before recommending or installing it; never add a separate skill just because a related source is listed here.

## Engineering defaults

Keep existing project conventions where they are sound. Use SOLID as a way to clarify ownership and dependency direction, not as a mandate to create a class or interface for every concept. Keep vertical changes together and test meaningful behavior at the narrowest useful boundary. Apply the Ponytail ladder: reuse, standard library, native platform, installed dependency, then minimum correct code. Security, data safety, error paths, and accessibility are requirements, not simplification targets.
