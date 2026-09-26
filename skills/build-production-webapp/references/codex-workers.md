# Codex workers

Read this when a product has jobs that ask Codex to inspect or change a repository, run commands,
or produce files. A coding-agent run is an asynchronous job with a restricted execution
environment. It uses the same PostgreSQL-first job contract in `async-jobs.md`, with extra state
for the remote session and produced artifacts.

## Choose the execution model

- Prefer the Agents API when the product needs a managed Codex harness, durable sessions, event
  delivery, or an OpenAI-hosted/self-hosted sandbox. The harness runs the agent loop; the
  environment runs commands and handles files. Keep the application server as the owner of
  identity, authorization, billing, business state, and review decisions.
- Use the Codex SDK when the product must run the Codex harness in infrastructure it operates.
  The application then owns the harness process, hosting, and lifecycle. Add a sandbox when runs
  need isolated files and commands.
- Use the Agents SDK when the application must own its agent loop, tools, orchestration, and
  approvals. Add a sandbox when runs need isolated files and commands.
- Use a local Codex CLI process only when the product explicitly requires that runtime and the
  host can isolate each workspace and execution. Do not assume an interactive desktop login is a
  production authentication or scaling strategy. Check current Codex CLI docs for supported
  noninteractive execution and sandbox options before implementation.
- For a short model response without tools or a workspace, use a normal model API call instead of
  adding a coding-agent worker.

Choose from product requirements and current official docs; do not combine multiple runtimes as a
speculative fallback.

## Durable orchestration

1. Authenticate and authorize the requesting user in the API. Validate a narrow task schema and
   assign a database run ID. Treat prompts, repository contents, issue text, and uploaded files as
   untrusted input. Never splice untrusted text into privileged developer instructions.
2. Persist the run and queue handoff in PostgreSQL before BullMQ. Return `202` with the run ID;
   HTTP handlers never execute Codex.
3. In the worker, conditionally claim the run, check the tenant and environment, and create or
   resume the remote agent session. Persist the provider, session ID, environment ID, workspace
   reference, attempt, and last received event cursor when the provider supports them.
4. Verify webhook signatures before accepting events. Translate provider events into guarded
   PostgreSQL transitions and user-safe progress records. Deduplicate event delivery, keep ordered
   events when ordering is supplied, and store the final result/artifact references before declaring
   completion. An `idle` session can still have a failed turn: inspect the turn outcome and tool
   results. Use provider idempotency keys for event submissions when the selected API supports them.
   Do not rely on Redis or remote session history as the product's only durable record.
5. On restart, resume or reconcile from the PostgreSQL run record. External session creation can
   succeed immediately before a worker crashes; use a transactional outbox/reconciler or provider
   idempotency support when available, and record/expire orphan sessions. Do not assert a provider
   idempotency guarantee without checking its current API.
6. Persist cancellation first, then signal the provider or executor best-effort. A late event must
   not overwrite a cancelled or otherwise terminal database state.

Model visible states separately from provider-specific states. Keep the task, user-facing progress,
terminal result, timestamps, and any human approval state in PostgreSQL. Store bulky output in
private object storage when required and persist scoped object keys, size, content type, and digest.

## Isolation and credentials

- Give each user/workload an isolated sandbox or disposable workspace. Do not mount a shared
  writable checkout or run untrusted jobs under the web application identity.
- Keep PostgreSQL and Redis private to the application network. The sandbox should receive only
  the tools and network destinations the task needs; default to disabled or restricted outbound
  networking for code execution when feasible.
- Never place the application's OpenAI API key in the agent workspace. Use distinct, least-
  privilege credentials for control-plane API calls and sandbox/executor registration. Inject
  third-party credentials through a trusted secret broker or provider vault only when needed.
- Treat files, terminal output, generated code, and model output as untrusted. Restrict filesystem
  paths, command execution, artifact downloads, exposed ports, and retention. Scan or validate
  generated artifacts before sharing them.
- Require explicit application-side authorization or human review before deploys, external writes,
  destructive actions, or access to another tenant's data. Tool availability is not authorization.
- Audit who requested the run, which repository/ref and tools it accessed, approval decisions,
  provider session identifiers, terminal result, and artifact checksums. Redact secrets and
  sensitive prompts from logs.

## Worker and operations

- Keep provider orchestration in a service and repository state writes behind the normal data
  layer. The BullMQ processor coordinates a run; it must not contain domain authorization or
  bypass the database state machine.
- Use bounded concurrency, per-user quotas, run deadlines, cancellation, retry/backoff rules,
  and spend limits. Avoid retrying a completed external side effect blindly.
- Handle provider webhook signatures, duplicate delivery, reconnects, timeouts, and terminal
  failures. Stream progress to clients from application-owned state rather than making a browser
  hold provider credentials.
- Keep the worker as a separate process/container from the API and frontend. Gracefully stop
  accepting work and close queue/provider connections on shutdown.
- Expose health/readiness and metrics for queue age, active runs, provider latency/failure,
  sandbox provisioning, orphan cleanup, and token/cost usage without recording secrets.
- Provision agent environments outside the app container unless a local self-hosted executor is a
  deliberate product requirement. Include its CPU/memory limits, disk cleanup, network policy,
  lifecycle, and unique deployment endpoint in the operations plan.

## Official references

Agent and sandbox APIs evolve. Before implementing provider calls, read the current docs for the
selected track:

- [Agents API overview](https://developers.openai.com/api/docs/guides/agents-api/overview)
- [Choose an agent runtime](https://developers.openai.com/api/docs/guides/agents)
- [Agents API architecture](https://developers.openai.com/api/docs/guides/agents-api/architecture)
- [Session webhooks](https://developers.openai.com/api/docs/guides/agents-api/sessions/webhooks)
- [Sandbox security](https://developers.openai.com/api/docs/guides/agents-api/environments/security)
- [Self-hosted sandboxes](https://developers.openai.com/api/docs/guides/agents-api/environments/self-hosted)
- [Agents SDK sandboxes](https://developers.openai.com/api/docs/guides/agents/sandboxes)
- [Codex CLI documentation](https://developers.openai.com/codex/)
