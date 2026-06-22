---
name: safe-monorepo-refactor
description: Safely restructure an existing repository into a monorepo or new directory layout without changing application behavior. Use for moving backend, frontend, tests, database, documentation, or configuration files while preserving API contracts, security behavior, database history, and working developer commands.
---

# Safe Monorepo Refactor

Restructure repositories as path-only changes. Treat behavior, public contracts, security boundaries, database history, and test expectations as invariants unless the user explicitly authorizes a separate behavior change.

## Guardrails

- Inspect the repository before moving files.
- Do not combine restructuring with feature work, cleanup, dependency upgrades, schema changes, formatting sweeps, or security redesign.
- Move existing files instead of recreating them when possible so Git can detect renames and preserve history.
- Do not delete an uncertain, generated, ignored, local, or apparently obsolete file silently. Stop and report what is uncertain, why it may matter, and the safe options.
- Do not commit, push, open a pull request, or otherwise publish changes automatically.
- Preserve application behavior throughout the move, including:
  - API route paths, methods, status codes, response bodies, validation, and error formats.
  - Prisma models, enums, relations, datasource behavior, migrations, and migration order.
  - JWT algorithm, claims, expiration, verification, revocation, and authentication errors.
  - Task ownership isolation and the existing not-found/unauthorized disclosure behavior.

## Workflow

### 1. Establish the baseline

Inspect tracked and relevant ignored files, directory structure, Git status, package manifests, lockfiles, entry points, imports, tests, environment loading, database configuration, generated-code paths, documentation, CI, deployment files, and editor or HTTP-client references.

Run the existing backend integration tests before moving files. If they fail, stop and report the baseline failure unless the user explicitly asks to continue.

Record the observable invariants that must remain unchanged.

### 2. Create an explicit move map

Before editing, provide or record a source-to-destination map for every file or directory that will move. Include files that remain at the repository root.

For each move, identify affected:

- Relative and absolute imports.
- Package scripts, package entry points, workspaces, and lockfile ownership.
- Test discovery, setup files, fixtures, and test database paths.
- Prisma config, schema, migrations, generated client output, and runtime client imports.
- Environment file discovery, environment examples, and working-directory assumptions.
- SQLite or other local database URLs and file locations.
- Documentation links, request collections, CI, deployment, Docker, and tooling paths.

Do not start the move while any required destination or path dependency is unresolved.

### 3. Move files safely

Use filesystem moves for existing files. Keep related path-dependent groups together, such as source plus tests or Prisma schema plus migrations.

Preserve ignored local data deliberately. Do not stage or recreate real `.env` files, credentials, tokens, API keys, production configuration, SQLite databases, journals, or generated local state.

Make the smallest configuration changes necessary to restore the previous commands and behavior from the intended working directory.

### 4. Repair path dependencies

Update all affected imports, scripts, test paths, environment examples, Prisma paths, generated-client paths, database URLs, documentation references, CI, and deployment configuration.

Ensure environment examples contain variable names and safe placeholders only. Never copy values from a real environment file.

Do not edit Prisma migration SQL or alter the schema as part of a path-only restructuring. If a path move appears to require a schema or migration change, stop and report it.

### 5. Validate behavior

Run the backend integration test suite after the move using the documented root-level and backend-level command, where applicable.

Verify:

- The server and test entry points resolve.
- Every existing API route remains mounted at the same method and path.
- Response and error formats remain unchanged.
- Registration, login, JWT verification, logout, and revocation retain their behavior.
- Authenticated task CRUD remains scoped to the current user.
- Cross-user task reads, updates, and deletes retain the same isolation and status behavior.
- Prisma can load its config and schema.
- The generated client resolves from its configured output.
- Existing migrations remain intact and ordered.
- Development and test database paths resolve to the intended locations.
- Documentation and request examples reference valid paths and unchanged routes.

### 6. Audit the result

Inspect `git diff`, including rename detection where available, and inspect `git status`.

Confirm:

- Changes are moves plus required path/configuration updates.
- No application behavior was intentionally changed.
- No tracked file disappeared without an explicit destination or explanation.
- No real secrets, `.env` files, local database files, database journals, or unrelated generated artifacts are staged.
- No migration was edited, reordered, replaced, or regenerated unexpectedly.
- No commit or push was performed.

If validation fails, diagnose path and working-directory issues first. Do not weaken tests or change behavior merely to make the restructuring pass.

## Definition of Done

The refactor is done only when:

- The final directory structure matches the requested layout.
- Every moved item is accounted for in the move map.
- Git represents existing content as moves/renames where practical.
- Imports, scripts, tests, Prisma, environment examples, and documentation resolve from their intended locations.
- Backend integration tests pass after the move.
- API, Prisma, JWT, and ownership invariants are unchanged.
- `git diff` and `git status` have been reviewed.
- No real secret or local database file is staged.
- Any uncertain file is preserved or explicitly reported.
- The user receives a concise summary of moves, compatibility updates, validation results, and remaining risks.
- No commit or push has occurred.

## Validation Checklist

- [ ] Repository inspected before edits.
- [ ] Baseline integration tests recorded.
- [ ] Explicit source-to-destination move map created.
- [ ] Existing files moved rather than recreated where possible.
- [ ] API routes and response formats preserved.
- [ ] Prisma schema and migrations preserved byte-for-byte unless explicitly authorized otherwise.
- [ ] JWT behavior and task ownership isolation preserved.
- [ ] Imports and runtime entry points updated.
- [ ] Package scripts and working-directory assumptions updated.
- [ ] Test discovery, setup, fixtures, and database paths updated.
- [ ] Environment examples updated with placeholders only.
- [ ] Prisma config, schema, migrations, generated output, and client imports resolve.
- [ ] Documentation, CI, deployment, and request references updated.
- [ ] Backend integration tests pass after the move.
- [ ] `git diff` inspected.
- [ ] `git status` inspected.
- [ ] No secrets, real environment files, or local database files are staged.
- [ ] No uncertain file was silently deleted.
- [ ] No commit or push was performed.
