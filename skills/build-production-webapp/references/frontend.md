# Frontend

## Data flow

Use Next.js App Router and React. Create one browser `QueryClient` through lazy state. Remote state
lives in TanStack Query; local interaction state uses React. Do not add Redux/Zustand by default.

```tsx
const [client] = useState(() => new QueryClient({
  defaultOptions: { queries: { staleTime: 15_000, retry: 1 } },
}));
```

Use the Hono RPC client with `credentials: "include"`. Query keys are arrays and hierarchical.
Include every filter in the key. Invalidate only affected roots after mutation. Poll only while a
job is active; stop at terminal state. Pass the query `AbortSignal` to fetch when using raw fetch.

## Components and design

Use shadcn source components already installed before custom markup. Inspect `components.json`
and current component docs. Base UI projects use `render`, not Radix `asChild`.

Before a new visual surface, derive its direction from the actual product, users, content, and
usage setting. Choose type, color, and layout intentionally; do not default to a generic SaaS
dashboard, identical card grids, decorative gradients, or a dark theme by category. Keep design
tokens consistent and centralize repeated controls in the existing component system. Keep copy
specific and actionable. Use purposeful motion, honor reduced-motion settings, and review the
result at mobile and desktop widths.

- Compose `FieldGroup` and `Field` for forms.
- Use semantic CSS variables instead of raw colors in components.
- Use `gap-*`, `size-*`, `cn()`, and existing variants.
- Use `Badge`, `Empty`, `Skeleton`, `Separator`, `Alert`, and accessible Dialog/Sheet titles.
- Put `data-icon` on button icons and let the component size them.
- Build a product-specific visual direction; never copy LocalRise colors or branding.

## Visual verification

After every user-visible frontend change, run the app and open each affected page or component in
a browser. Exercise changed interactions, including menus, dialogs, forms, and their relevant
open, closed, loading, empty, and error states. Capture and inspect screenshots at desktop and
mobile widths. Check layout, text, spacing, alignment, overflow, contrast, focus, touch targets,
and consistency with the product's existing UI patterns. Fix visible issues and inspect the result
again. Use an available browser or screenshot tool; do not add a test dependency solely for this
review. If a view cannot be opened or captured, report the exact limitation and leave the visual
check unverified rather than claiming it passed.

### Component unification contract

- Put cross-product primitives and their variants in the canonical shared component directory
  (`components/ui` in shadcn projects). Put product-specific compositions in domain component
  directories such as `components/jobs` or `components/settings`.
- Search existing components before creating markup. Extend the canonical component or variant
  when the same visual or interaction pattern already exists; do not create parallel versions.
- Pages and route files orchestrate data, state, and domain components. They do not own repeated
  control styling, panel structure, field markup, status treatments, empty states, or fact lists.
- Keep styles and tokens behind the canonical component. Delete superseded implementations and
  add one lightweight architecture or render check when duplication could regress silently.

Write UI copy from the user's perspective with consistent action names. Empty states explain the
next action. Errors state what happened and how to recover without leaking internals.

## Accessibility and performance

Target WCAG 2.2 AA: semantic HTML, labels, keyboard operation, visible focus, 44px touch targets,
non-color state cues, responsive tables, zoom-safe layouts, and `prefers-reduced-motion`.

Avoid request waterfalls; run independent work in parallel. Keep backend-only imports out of
client modules. Import heavy optional UI dynamically only when measured or obviously large. Do not
memoize cheap expressions. Do not define components inside components. Prefer native controls and
CSS before JavaScript widgets.

For detailed React rendering, request, and bundle guidance, read
[references/react-performance.md](react-performance.md). For accessibility or visual audits,
inspect the exact changed surface and use the [current Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)
when available; report actionable file and line findings.
