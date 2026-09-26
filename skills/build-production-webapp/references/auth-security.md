# Authentication and Security

## Better Auth baseline

Use the Prisma adapter, email/password, username, and admin plugins. Disable public sign-up for
the admin-managed baseline. Bootstrap the first admin only when the user table is empty, using a
non-routable internal email derived from the configured username.

- Require a random `BETTER_AUTH_SECRET` of at least 32 characters.
- Set the exact public backend base URL and exact frontend trusted origin.
- Enable secure cookies in production.
- Use `credentials: "include"` in browser clients.
- Protect admin actions in backend middleware; hidden navigation is not authorization.
- Scope normal-user repository queries by authenticated user ID.
- Re-run Better Auth schema generation guidance after enabling plugins, then review and migrate.

Do not add OAuth, password reset email, 2FA, passkeys, or organizations without product needs and
their delivery/storage requirements.

## HTTP and audit

Apply request IDs and secure headers before routes. CORS uses one configured origin, credentials,
and an explicit method/header list. Log every request's method, path, status, duration, request ID,
and authenticated user when available; never log bodies, passwords, cookies, authorization
headers, tokens, or raw untrusted documents. Redact error strings before persistence.

## Files and untrusted input

When uploads become necessary:

- enforce request, per-file, total-size, count, extension, and MIME limits;
- reject separators, controls, absolute paths, traversal, ZIP symlinks, and extracted-size bombs;
- generate stored names; persist metadata and relative paths, never container-local absolute paths;
- stage run-scoped files under a shared run workspace;
- reject symlinks and verify resolved paths remain below the workspace root;
- scan files before worker use and treat embedded agent instructions as untrusted data;
- remove files and workspaces after terminal state/retention expiry.

Use parameterized queries. If a debugging SQL surface is ever required, protect it with admin auth,
allow one validated `SELECT`, run a PostgreSQL `READ ONLY` transaction, set a short statement
timeout, cap rows, and never expose it as a normal product feature.

Keep secrets in environment/secret stores. Commit `.env.example`, never `.env`. Detect private
keys in pre-commit. Use non-root containers, minimal writable mounts, dropped capabilities, and
private networks for PostgreSQL and Redis.
