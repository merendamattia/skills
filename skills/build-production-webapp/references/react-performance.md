# React and Next.js performance

Use this guide for React and Next.js rendering, data loading, state, and bundle work. Measure the relevant route or interaction when practical; preserve behavior and project conventions. Treat these as review priorities, not a mandate to rewrite unrelated code.

## Prevent request waterfalls

- Start independent requests together with `Promise.all`; defer an `await` until the result is needed when doing so permits unrelated work to start sooner.
- Avoid serial server-component or route-handler fetches when the inputs are already available. Reshape the data boundary or load independent data concurrently.
- Use streaming and Suspense boundaries where partial content can help the user. Keep boundaries around meaningful independent sections, not every component.
- Pass cancellation signals through query functions and fetch calls when the caller owns cancellation.

## Keep the client bundle small

- Prefer Server Components for static or server-owned work in Next.js. Add a Client Component boundary only for browser APIs, local interaction, or client-managed state.
- Keep that boundary near the interactive component; avoid marking whole page trees as client rendered to support one control.
- Dynamically load genuinely heavy, infrequently used client features. Do not add dynamic imports for small or always-visible components.
- Import only the packages and symbols needed. Avoid broad barrel imports when they make the bundler include unrelated modules.
- Load optional third-party code after the primary experience when its result is not needed for the first render.

## Use React state and effects for their intended work

- Keep derived values derived during render. Do not mirror props or query data in state and synchronize them with an effect.
- Use effects to connect to external systems, with complete dependencies and cleanup. Do not use them as a second data-fetching framework when a query library or server component owns the request.
- Keep state as close as possible to the components that use it. Avoid a global store for server state already owned by TanStack Query.
- Keep component definitions at module scope. Memoize only after profiling or when stable identity is required by a measured boundary.
- Preserve stable keys for lists and avoid index keys where rows can be inserted, removed, or reordered.

## Treat server actions as trust boundaries

Authenticate and authorize each server action just as you would an API route. Validate its input, scope database reads and writes to the current user or tenant, and return a safe error shape. A hidden button or a client-side guard is not authorization.

## Verify changes

Use the production build and an appropriate profiler, browser trace, bundle analyzer, or request log for the suspected bottleneck. Compare the same route and scenario before and after where feasible. Avoid speculative memoization or architecture changes without evidence.

The upstream Vercel guide has more examples and can change: `https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices`. Check the version relevant to the installed React and Next.js releases.
