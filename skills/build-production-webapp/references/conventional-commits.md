---
name: conventional-commits
description: Create, split, stage, review, amend, or prepare Git commits with Conventional Commits syntax, repository-specific types and scopes, atomic file grouping, Caveman-style concise titles, and complete commit bodies. Open pull requests with repository-matched titles, descriptions, validation summaries, and propagated issue-closing references for branch promotions. Use whenever a task involves committing changes, writing a commit message, splitting work into multiple commits, deciding which files belong in a commit, or opening a pull request.
---

# Conventional Commits

Use this skill for every commit-related task. Create a commit only when the user explicitly asks; otherwise prepare the split and messages without mutating Git history.

## Workflow

### 1. Read repository rules

Inspect local guidance before deciding the message:

```bash
git status --short
git diff --stat
git diff --name-status
git diff --cached --stat
git diff --cached --name-status
```

Read contribution docs, Conventional Commit configuration, commit-lint configuration, and relevant project instruction files when present. Local rules override this skill.

When the repository exposes this type set, use these meanings:

- `feat` — add or remove an API/UI feature.
- `fix` — fix an API/UI bug.
- `refactor` — restructure code without changing API/UI behavior.
- `perf` — refactor that improves performance.
- `style` — formatting or whitespace-only meaning-preserving change.
- `test` — add or correct tests.
- `build` — build tools, dependencies, project version, or build components.
- `ops` — infrastructure, deployment, backup, recovery, or operations.
- `ci` — CI configuration and scripts.
- `docs` — documentation-only change.
- `chore` — miscellaneous repository maintenance, such as `.gitignore`.
- `merge` — an actual merge commit.
- `revert` — a revert of a previous commit.

Do not invent a type. If repository rules differ, use their allowed list.

### 2. Understand and partition the diff

Read the complete working-tree and staged diffs before staging more files. Classify every changed file and hunk by the logical feature, fix, or maintenance unit it serves.

Make one commit per logical unit:

- Keep all files required by one feature or fix together, including implementation, schema/migration, tests, and directly necessary docs.
- Separate unrelated features, fixes, refactors, or maintenance into separate commits, even when changed in the same task.
- If one file contains multiple units, stage hunks with `git add -p` (or an equivalent patch workflow).
- Never use `git add .` or `git commit -a` when the tree contains more than one logical unit.
- Preserve pre-existing staged or unstaged user work. Never reset, unstage, amend, rebase, or rewrite it without explicit permission.
- If existing staged work mixes unrelated units and cannot be safely isolated, stop and ask before changing the index.

Before each commit, confirm the staged file list matches exactly one unit:

```bash
git diff --cached --name-status
git diff --cached --check
git diff --cached
```

### 3. Write the subject

Use this shape:

```text
<type>(<scope>): <title>
```

Prefer a short, lowercase, precise scope in parentheses, derived from the primary domain or area (`frontend`, `transactions`, `charts`, `ci`, `backend`, and similar). Use one scope, not a file dump. Omit scope only for a genuinely cross-cutting change with no honest primary area. Never put a space before `(`.

Apply the `caveman` skill to the title only: remove filler, use imperative mood, state the user-visible or engineering outcome, keep technical terms exact, stay concise, avoid a period, and follow the repository's length limit; use under 50 characters when no local limit exists. Keep the body normal and complete; compression must never remove useful detail.

Use `!` after the type or scope only for a real breaking change, and explain the migration in a `BREAKING CHANGE:` footer.

Examples:

```text
feat(transactions): group recurring movements
fix(frontend): keep popup data live
perf(prices): batch cached quote reads
```

### 4. Write the body

Every commit message must have a detailed body. Describe all work represented by the staged files, why it was needed, behavior or contract changes, important edge cases, and validation. Do not claim checks that were not run.

Use this structure for every commit you write:

```text
<type>(<scope>): <title>

What:
- Describe each behavior or code change.

Why:
- Explain problem, intent, and relevant trade-off.

Files:
- `path/to/file`: explain its role in this commit.

Validation:
- `command`: result, or state why it was not run.
```

List every changed file's role in `Files`, not only the main file. Add issue/PR references and required footers after the body. For generated `merge` and `revert` messages, preserve Git's required first line and add this detail when the command supports editing.

### 5. Commit and verify

Stage only the selected unit, then commit. Let installed hooks run; never bypass them with `--no-verify`.

```bash
git add -- path/to/file-a path/to/file-b
git diff --cached --check
git diff --cached --name-status
git commit -m '<type>(<scope>): <title>' -m '<complete body>'
git show --stat --oneline --format=fuller HEAD
git status --short
```

If a hook rejects the commit, fix the message or staged content and retry. After each commit, verify that only the intended unit was committed and that remaining files still belong to the remaining units. Report commit hashes, subjects, file groups, and validation results.

## Pull requests

Open a pull request only when the user asks for one. Treat the PR as the
review wrapper around the commits; do not rewrite commit messages to match the
PR title.

### Preserve issue closures across branch promotions

When promoting one branch into another—especially `develop` into the default
`main` branch—carry forward every issue that was closed by an included PR.
GitHub does not reliably carry a closing reference from a PR merged into
`develop` to the later PR merged into `main`; the promotion PR must repeat it.

Before drafting the promotion PR:

1. Determine the merged PRs included in the source-to-target range. For a
   `develop` → `main` promotion, inspect merged PRs targeting `develop` since
   the target branch's last release/merge.
2. Read each included PR with `gh pr view <number> --json body,commits,baseRefName,headRefName,mergeCommit`.
   Collect issue numbers from the body and commit messages using the GitHub
   closing keywords `Closes`, `Fixes`, and `Resolves`. If an API exposes
   closing-issue metadata, use it as a cross-check; do not assume that the
   local `gh pr view --json` schema has a `closingIssues` field.
3. Deduplicate the issue numbers and add every one to the new PR body as an
   explicit keyword reference, one per line, for example:

   ```text
   Closes #5
   Closes #12
   ```

   Keep these references even when the earlier PR body already contained
   them. Do not invent issue numbers or propagate references from PRs that are
   not included in the promotion range.
4. Verify the final PR body contains the complete deduplicated list before
   creating the PR. This is required for the issues to close automatically
   when the promotion PR merges into `main`.

### 1. Inspect repository style

Before drafting the PR, inspect recent PRs targeting the intended base branch:

```bash
gh pr list --state all --limit 10 --base main --json number,title,body,headRefName,baseRefName,state,mergedAt,url
```

Read the latest relevant PR bodies with `gh pr view` when the list is not
enough. Match the repository's established title casing and description shape.
Do not invent a template or add headings merely because another repository
uses them.

### 2. Draft from the actual diff

Use the primary user-visible or engineering outcome as the PR title. Summarize
all commits included in the PR in a concise, factual description covering what
changed, why it changed, and the validation performed. Do not claim checks,
reviews, deployments, or screenshots that did not happen. Include every
logical unit in the branch, including separate maintenance commits, or split
the work into separate PRs when the units need independent review.

### 3. Create and verify

Confirm the branch is pushed and clean, and check for an existing PR before
creating a duplicate:

```bash
git status --short --branch
gh pr list --head "$(git branch --show-current)" --base main --state open --json number,url,title
```

Write the exact description to a temporary file, then create the PR with the
repository's base branch:

```bash
gh pr create --base main --head "$(git branch --show-current)" --title "<repository-matched title>" --body-file /tmp/<repo>-pull-request.md
```

After creation, verify the URL, title, base/head branches, and body with
`gh pr view`. When the task requires confidence that the change works, wait
for the PR checks with `gh pr checks` or `gh run watch` and report any
remaining GitHub-only checks separately.
