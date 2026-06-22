# Backend Restructuring and OpenAPI Execution Plan

## Current State

- The working Express backend is at the repository root:
  - application code in `src/`
  - Prisma schema and migrations in `prisma/`
  - Vitest/Supertest integration tests in `tests/`
  - package files, Prisma config, Vitest config, environment example, and HTTP requests at the root
- The backend exposes unchanged `/api/health`, `/api/auth`, `/api/weather`, and `/api/tasks` routes.
- JWT authentication uses HS256 access tokens with one-hour expiration and database-backed token revocation.
- Task reads, updates, and deletes are scoped by both task ID and authenticated user ID.
- Baseline validation passed on June 22, 2026: 1 test file and 8 tests passed.
- Prisma schema and migration SHA-256 hashes were recorded before the move.
- The premature untracked `frontend/` tree has been removed. No frontend will be created in this execution.

## Desired Outcome

1. Move the complete backend into `backend/` without changing API behavior, security behavior, response formats, schema, migrations, or tests.
2. Validate Prisma generation, all backend tests, backend startup, and `/api/health`.
3. Only after those checks pass, add an implementation-derived OpenAPI 3.1 contract at `backend/openapi.yaml`, serve Swagger UI and the raw YAML, and add documentation-route integration tests.

## Explicit Move Map

| Source | Destination |
| --- | --- |
| `src/` | `backend/src/` |
| `tests/` | `backend/tests/` |
| `prisma/` | `backend/prisma/` |
| `package.json` | `backend/package.json` |
| `package-lock.json` | `backend/package-lock.json` |
| `prisma.config.ts` | `backend/prisma.config.ts` |
| `vitest.config.js` | `backend/vitest.config.js` |
| `.env.example` | `backend/.env.example` |
| `requests.http` | `backend/requests.http` |
| ignored `generated/` | ignored `backend/generated/` |
| ignored `node_modules/` | ignored `backend/node_modules/` |
| ignored `dev.db` | ignored `backend/dev.db` |

Items intentionally remaining at the root:

- `.git/` and all Git history
- `.gitignore`, updated only for the new backend paths
- `AGENTS.md`
- `.codex/skills/safe-monorepo-refactor/`
- `.codex/skills/openapi-contract/`
- `PLANS.md`
- the existing ignored real `.env`, unchanged and never printed or staged

No root workspace package will be added unless validation reveals a concrete need.

## Path and Configuration Inventory

- Package entry points and scripts continue to use `src/server.js`, now relative to `backend/`.
- Internal ES-module imports remain valid because `src/` moves as one directory tree.
- Test imports remain valid because `tests/` and `src/` keep the same sibling relationship.
- Vitest setup paths remain `./tests/global-setup.js` and `./tests/setup.js`, now resolved from `backend/`.
- Prisma config paths remain `prisma/schema.prisma` and `prisma/migrations`, now resolved from `backend/`.
- Prisma generated output remains `../generated/prisma` relative to `backend/prisma/schema.prisma`, producing `backend/generated/prisma`.
- The runtime Prisma import remains `../../generated/prisma/client.ts` relative to `backend/src/lib/prisma.js`.
- Test `DATABASE_URL=file:./prisma/test.db` resolves to `backend/prisma/test.db` when commands run from `backend/`.
- The ignored development SQLite database moves to `backend/dev.db`, matching a backend-local `file:./dev.db` URL.
- The real root `.env` is not moved or edited. Local validation will set `DOTENV_CONFIG_PATH=../.env` while running from `backend/`; normal backend setup is documented through `backend/.env.example`.
- `requests.http` moves intact and keeps the same public localhost API URLs.
- No CI, deployment, Docker, README, or `docs/` files currently exist and therefore require path repair.

## Invariants

- Preserve all methods, paths, status codes, response bodies, validation messages, and error envelopes.
- Preserve registration, login, current-user lookup, logout, HS256 JWT verification, one-hour expiration, token IDs, and revocation behavior.
- Preserve owner-only task list, read, update, and delete behavior, including 404 responses for cross-user item access.
- Preserve weather provider requests and response mapping.
- Preserve Prisma models, enums, relations, datasource provider, migrations, and migration order byte-for-byte.
- Do not edit business logic during the move.

## Milestones

1. Complete repository inspection and baseline tests.
2. Move backend files and ignored backend-local state according to the move map.
3. Repair ignore rules and any path assumptions exposed by validation.
4. Generate the Prisma client and verify schema/migration hashes.
5. Run all backend tests, start the backend, and verify `/api/health`.
6. Audit Phase 2 diff and status. Stop if any required validation fails.
7. Inventory implemented routes, schemas, validation, and errors.
8. Add `backend/openapi.yaml`, Swagger UI, raw YAML serving, required dependencies, and integration tests.
9. Run final backend tests and HTTP checks, then audit diff and status.

## Validation Commands

From `backend/`:

- `npm.cmd install` only if moved dependencies are incomplete
- `npx.cmd prisma generate`
- `npm.cmd test`
- `npm.cmd start` with `DOTENV_CONFIG_PATH=../.env` for local validation

HTTP checks:

- `GET http://127.0.0.1:<validation-port>/api/health`
- Swagger UI route selected during Phase 3
- raw OpenAPI YAML route selected during Phase 3

Repository audit:

- `git diff --find-renames`
- `git status --short`
- schema and migration SHA-256 comparison
- ignored/staged secret, database, log, and generated-file audit

## Risks and Decisions

- Moving ignored `node_modules/`, generated Prisma output, and `dev.db` preserves local state and avoids silently deleting uncertain backend artifacts. They remain ignored.
- The real root `.env` is intentionally preserved in place to comply with the no-edit rule. This leaves a local setup warning: backend commands normally expect `backend/.env`; validation uses `DOTENV_CONFIG_PATH` without exposing values.
- Dependency installation for Swagger may require network approval. No Swagger work starts until Phase 2 passes.
- OpenAPI will document only behavior proven by routes, controllers, services, Prisma selections, middleware, and tests.
- Documentation routes will load the single YAML file rather than duplicate the contract in JavaScript.

## Progress

- [x] Remove the premature untracked frontend.
- [x] Inspect tracked and relevant ignored backend files.
- [x] Record baseline schema and migration hashes.
- [x] Run baseline integration tests: 8 passed.
- [x] Create the move map and path inventory.
- [x] Move the backend into `backend/`.
- [x] Generate Prisma client and validate Phase 2.
- [x] Add OpenAPI and Swagger integration.
- [x] Run final validation and repository audit.
