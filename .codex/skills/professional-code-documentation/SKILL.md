---
name: professional-code-documentation
description: Professionally document an existing JavaScript, TypeScript, React, Express, Prisma, Vitest, or Supertest codebase with concise file-level comments, inline comments, JSDoc, and TSDoc while preserving executable behavior. Use for backend or frontend source, exported functions, components, hooks, contexts, middleware, controllers, services, database access, external integrations, test setup, regression scenarios, and audits of incomplete, inaccurate, or misleading code comments.
---

# Professional Code Documentation

## Purpose

Document an existing codebase so another developer can understand:

- File responsibilities and architectural roles.
- Inputs, outputs, side effects, and error behavior.
- Authentication and authorization boundaries.
- Data ownership rules.
- External integrations.
- State transitions and lifecycle-sensitive behavior.
- Non-obvious implementation decisions.

Do not comment every line. Add concise, high-signal documentation only where it materially improves understanding.

## When to Use

Use this skill for:

- Documenting an existing backend or frontend.
- Documenting exported functions and React components.
- Documenting middleware, controllers, and services.
- Documenting authentication flows, database access, and external API integration.
- Documenting test setup and important regression scenarios.
- Auditing existing comments for accuracy.
- Improving incomplete or misleading code documentation.

Do not use this skill for general README, architecture, deployment, or portfolio documentation unless the task explicitly includes those files.

## Mandatory Repository Inspection

Before editing any source file, inspect:

- `AGENTS.md`.
- `PLANS.md`.
- Relevant repository-specific skills.
- Backend and frontend `package.json` files.
- Repository structure.
- Source entry points.
- Route definitions.
- Middleware.
- Controllers.
- Services.
- Authentication implementation.
- Authorization and ownership checks.
- Prisma schema.
- Prisma client setup.
- OpenAPI contract.
- Frontend API client.
- Frontend session handling.
- React contexts and hooks.
- Automated tests and test setup.
- Existing comments and documentation.

Run:

```bash
git branch --show-current
git status --short
```

Stop before editing when:

- The current branch is unexpected.
- Unrelated working-tree changes overlap the requested scope.
- The requested allowlist is unclear.
- Source files contain unresolved conflicts.

## Explicit File Allowlist

Require the task prompt to provide an explicit list of files or directories that may be changed before documentation begins. Edit only files inside that allowlist. Everything else must remain unchanged.

Typical scopes include:

```text
backend/src/
backend/tests/
frontend/src/
```

A task may define a narrower file-level allowlist. Never expand scope without explicit permission.

## Strict Documentation-Only Boundary

Add or improve documentation only.

Allowed changes:

- File-level comments that provide useful architectural context.
- JSDoc and TSDoc comments.
- Concise inline comments for non-obvious behavior.
- Comments explaining security-sensitive decisions, ownership constraints, status or data mapping, side effects, error handling, request flow, state transitions, or lifecycle-sensitive React behavior.
- Comments explaining test isolation or regression intent.
- Whitespace directly required to place comments cleanly.

Forbidden changes:

- Modifying executable statements, expressions, conditions, loops, return values, function signatures, parameters, default values, or types.
- Renaming variables, functions, components, classes, or files.
- Moving files or executable code.
- Reordering executable statements.
- Adding, removing, changing, or reordering imports or exports.
- Adding imports only for documentation.
- Changing API routes, HTTP methods, request bodies, response bodies, status codes, validation, or error handling.
- Changing authentication, authorization, task ownership, JWT behavior, or token revocation.
- Changing database queries, Prisma schema, or Prisma migrations.
- Changing React state, effects, rendering behavior, component props, or CSS.
- Changing tests, fixtures, snapshots, or test behavior.
- Changing OpenAPI, package files, lockfiles, environment files, deployment configuration, `AGENTS.md`, `PLANS.md`, or execution plans.
- Installing or removing dependencies.
- Inspecting or editing real `.env` files.
- Running formatters that rewrite unrelated code.
- Committing, pushing, merging, creating pull requests, or deploying.

If documentation cannot be added without changing executable code, report the limitation and leave the file unchanged. Treat any executable-code change as a task failure.

## English-Only Code Documentation

ALL documentation added inside source code must be written in professional English only.

This rule applies without exception to:

- File-level, inline, and block comments.
- JSDoc and TSDoc comments.
- React component, function, class, middleware, controller, service, hook, and context documentation.
- Test and configuration comments.
- Examples inside code comments.
- Documentation-related TODO notes.

Do not add Hebrew comments, bilingual comments, Hebrew explanations beside English comments, or translated duplicate comments. Do not translate identifiers or executable code. Preserve existing Hebrew comments unless the task explicitly authorizes replacing them.

The final Codex report may use the language requested by the user. Every comment or documentation block inserted into code must use clear, professional, technically precise English.

## Comment Quality Standard

Explain why behavior exists, the architectural role it serves, important constraints, side effects, security boundaries, non-obvious mappings, and caller-relevant errors. Do not narrate obvious syntax or repeat code in natural language.

Bad:

```javascript
// Import Express.
import express from "express";

// Set loading to true.
setLoading(true);

// Return the user.
return user;
```

Good:

```javascript
// Requests without an Origin header remain available to automated tests,
// API clients, and server-to-server callers that are not browser-enforced.
```

```typescript
/**
 * Sends authenticated API requests and clears the stored session when the
 * backend reports that the bearer token is no longer valid.
 */
```

```javascript
/**
 * Returns only tasks owned by the authenticated user.
 *
 * The user identifier is derived from the verified JWT and is never accepted
 * from the request body or query string.
 */
```

## File-Level Documentation

Inspect every file in the requested scope and classify it as:

- Documentation already sufficient.
- Needs file-level context.
- Needs exported-function documentation.
- Needs non-obvious logic comments.
- Should remain unchanged because it is self-explanatory.

Add a file-level comment only when it explains meaningful context such as the file's architectural role, layer, major dependencies, security boundaries, important side effects, or interaction with other layers.

Do not add repetitive banners such as:

```javascript
// This file contains functions.
```

Do not add headers that only restate the filename.

## JSDoc and TSDoc Rules

Consider documentation for:

- Exported functions, classes, and constants with non-obvious purposes.
- Exported React components, hooks, and contexts.
- Middleware, controllers, and services.
- Authentication, JWT, database-access, and external-provider helpers.
- Mapping and lifecycle-sensitive functions.
- Functions with meaningful side effects or meaningful thrown errors.

Use only useful content:

- A concise purpose.
- `@param` when parameter meaning is not obvious.
- `@returns` when the return contract needs explanation.
- `@throws` when callers need to understand an error condition.
- Authentication or ownership requirements.
- Side effects and external dependencies.

Do not add empty descriptions.

Bad:

```javascript
/**
 * Updates a task.
 * @param id The id.
 * @param input The input.
 */
```

Prefer:

```javascript
/**
 * Updates a task owned by the authenticated user.
 *
 * Returns null when the task does not exist or belongs to another user,
 * preventing callers from distinguishing missing resources from unauthorized
 * ownership.
 */
```

## Backend Documentation Rules

Consider important behavior across:

- Server startup and Express application setup.
- JSON parsing, CORS configuration, health checks, OpenAPI mounting, and route registration.
- Authentication middleware, JWT verification, and revoked-token checks.
- Controllers, service-layer responsibilities, Prisma access, and request validation.
- Task ownership isolation.
- Registration, login, logout, and current-user retrieval.
- Weather-provider requests and external API error normalization.
- Centralized error handling.

Document security-sensitive behavior where relevant:

- Authenticated identity comes from a verified token.
- Task ownership is enforced using the authenticated user's ID; task IDs alone are insufficient.
- Revoked JWTs are rejected.
- Logout revokes the presented token.
- CORS is a browser policy, not authentication.
- Requests without an `Origin` header may be accepted for API tools, tests, and server-to-server clients.
- Secrets are read from environment variables.
- Database connection strings must not be exposed.

Do not make unsupported security guarantees or describe the system as fully secure, enterprise-grade, or attack-proof.

## Frontend Documentation Rules

Consider important behavior across:

- Application startup.
- Authentication context and session restoration.
- Local token persistence.
- Centralized API requests, bearer-token injection, and unauthorized-response handling.
- API error normalization and request/response mapping.
- Weather search and task list, creation, editing, status changes, deletion, and filtering.
- Loading, empty, success, validation, authentication, and server-error states.
- Dialog and accessibility-sensitive behavior.
- Stale-request or race-condition protection when it exists.

For React components, document responsibility, important props, meaningful side effects, shared-state dependencies, accessibility responsibilities, and unusual lifecycle decisions. Do not explain ordinary JSX line by line, comment simple markup, or make components harder to scan.

## Test Documentation Rules

Document tests only when comments clarify:

- Test database isolation.
- Global setup, setup, or teardown.
- Authentication fixtures.
- Ownership-isolation scenarios.
- Mock-server behavior.
- External-provider mocking.
- Regression intent.
- Why a scenario protects an important boundary.

Do not comment every assertion, rewrite test names merely for documentation, or change test behavior.

## Configuration Documentation Rules

Add comments to configuration files only when:

- The format supports comments.
- The file is inside the explicit allowlist.
- The comment explains a non-obvious project decision.

Do not add comments to JSON files. Do not modify `package.json`, lockfiles, generated files, or Prisma migrations.

## Generated and Third-Party Files

Do not document:

- `node_modules`.
- Build or compiled output.
- Generated Prisma client files.
- Dependency lockfiles.
- Generated coverage files.
- Minified files.
- External vendor files.
- Cached files.

Treat generated files as read-only.

## Required Workflow

### Phase 1: Preflight

- Run `git branch --show-current` and `git status --short`.
- Read repository instructions.
- Confirm the explicit allowlist.
- Stop when the workspace is unsafe.

### Phase 2: Inventory

Build a complete inventory of relevant files in scope. Classify every file as change required, no change required, already documented, generated or excluded, or blocked by scope.

### Phase 3: Documentation Plan

Before editing, report:

- Exact allowed paths.
- Number of files inspected.
- Number of files expected to change.
- Documentation approach.
- Validation commands.
- Files intentionally excluded.

### Phase 4: Documentation

Add concise English-only documentation. Preserve useful existing comments, avoid duplicates, and do not modify executable code.

### Phase 5: Behavioral Diff Audit

Inspect the full diff. Confirm every change is limited to comment lines, JSDoc or TSDoc blocks, and whitespace directly necessary for those comments. Treat changes to executable tokens as a failure.

When practical, compare code before and after with comments removed to confirm executable behavior is identical.

### Phase 6: Validation

For backend documentation, run from `backend/`:

```bash
npm test
```

For frontend documentation, run from `frontend/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Also run:

```bash
git diff --check
git diff --stat
git diff
git status --short
```

Do not report a check as passing unless it executed successfully. Report unavailable tools honestly.

### Phase 7: Final Review

Confirm:

- All comments added to source code are English only; no Hebrew comments were added.
- No application behavior or source statement changed.
- No import, export, or type changed.
- No test behavior or configuration changed.
- No package, environment, API contract, database schema, migration, generated file, or deployment configuration changed.
- No commit or push occurred.

## Recommended Execution Scope

Do not document the entire repository in one uncontrolled edit. Prefer separate tasks:

1. Backend source.
2. Backend tests.
3. Frontend source.
4. Frontend tests.

After each scope, inspect the diff, run relevant validation, confirm comment-only changes, and review before continuing. A user may explicitly authorize a broader scope, but behavior-preservation requirements remain unchanged.

## Final Report Requirements

Include:

- Branch name and original working-tree status.
- Explicit allowlist.
- Files inspected and documented.
- Files intentionally left unchanged.
- Files excluded as generated or unsupported.
- Documentation areas added.
- Validation commands executed.
- Passed, failed, and unavailable checks.
- Unresolved documentation gaps.
- Confirmation that all newly added code documentation is English only.
- Confirmation that no executable behavior changed.
- Confirmation that no import, export, type, API, database, dependency, environment, test, or deployment configuration changed.
- Confirmation that no commit or push was performed.

## Definition of Done

The task is complete only when:

- Every relevant file in scope was inspected.
- Every significant exported function, class, component, hook, context, middleware, controller, and service was considered.
- Non-obvious behavior is documented while obvious code remains uncluttered.
- All newly added code comments are accurate, concise, and English only.
- No executable behavior changed.
- No files outside the allowlist changed.
- Relevant validation commands pass.
- The diff contains documentation-only changes.
- No secret was exposed.
- No commit or push was performed unless explicitly requested.
