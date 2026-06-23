# Weather Information API Repository Instructions

## Project Goal

This repository is a portfolio-quality full-stack weather and task management application.

The project must demonstrate:

- professional backend architecture
- secure authentication
- weather API integration
- authenticated task CRUD
- automated testing
- OpenAPI documentation
- a distinctive responsive frontend
- clear and concise developer documentation
- deployment readiness

## Repository Structure

The intended repository structure is:

- `backend/` for the Express, Prisma, PostgreSQL, authentication, weather, task, and API test code
- `frontend/` for the responsive web application
- `docs/` for concise technical documentation
- `README.md` for the public portfolio overview
- `.codex/skills/` for repository-specific Codex workflows

Do not mix frontend source code into the backend directory.

## Change Safety

Before modifying files:

1. Inspect the relevant code and tests.
2. Explain the intended change briefly.
3. Preserve existing behavior unless the task explicitly requests a behavior change.
4. Prefer small, reviewable changes over broad rewrites.
5. Do not delete working functionality merely to simplify implementation.

Never modify, expose, print, or commit real secrets.

Do not edit `.env` files.

Use `.env.example` files only for documented placeholder variables.

## Backend Rules

The backend uses:

- Node.js
- Express
- ES modules
- Prisma
- PostgreSQL
- JWT authentication
- Vitest
- Supertest

Preserve the existing layered architecture:

- routes
- middleware
- controllers
- services
- Prisma data access

Authenticated task operations must always be scoped to the authenticated user.

A user must never be able to read, update, or delete another user's task.

Preserve the current API routes unless an explicit API migration is requested.

## Frontend Rules

Use:

- React
- Vite
- TypeScript

The frontend must:

- communicate with the real backend API
- support registration, login, logout, and session restoration
- support current weather search
- support complete task CRUD
- support status and category filtering
- handle loading, empty, success, validation, authentication, and server-error states
- be responsive on desktop and mobile browsers
- meet basic accessibility requirements
- respect reduced-motion preferences

Do not use a large generic component library.

Create a small project-specific design system using reusable components, CSS variables, spacing tokens, typography tokens, and responsive layout primitives.

## Design Direction

The visual concept is an atmospheric weather operations dashboard.

The interface should feel:

- modern
- distinctive
- calm
- intelligent
- polished
- portfolio-ready

Avoid a generic admin dashboard appearance.

Use weather-inspired atmospheric backgrounds, restrained glass effects, strong typography, meaningful data hierarchy, and subtle motion.

Do not sacrifice usability or accessibility for decoration.

## OpenAPI Rules

Maintain one OpenAPI source of truth in:

`backend/openapi.yaml`

It must document:

- authentication
- health
- current weather
- task CRUD
- status and category filters
- request bodies
- successful responses
- validation errors
- authentication errors
- not-found responses
- reusable schemas and security definitions

Swagger UI must be served by the backend.

The documented contract must match the actual implementation.

## Testing Requirements

After backend changes, run:

`npm test`

from the backend package or the equivalent root workspace command.

After frontend changes, run:

- lint
- type checking
- unit tests
- production build

For responsive UI changes, verify at desktop and mobile viewport sizes.

When Playwright is available, use it for browser-level verification.

## Documentation Rules

Documentation must be concise, factual, and derived from the actual source code.

Do not claim that a feature exists unless it can be verified from code or tests.

Avoid repeating the same information in README, OpenAPI, and docs files.

Use:

- README for portfolio overview and quick start
- OpenAPI for endpoint contracts
- architecture documentation for system structure
- development documentation for local setup and commands
- deployment documentation for production configuration

## Git Rules

Do not commit or push changes unless explicitly requested.

Before finishing a task:

1. run the relevant checks
2. inspect `git diff`
3. inspect `git status`
4. summarize changed files
5. report commands executed
6. report checks that passed or failed

Do not modify unrelated files.

## Execution Plans

For repository-wide restructuring, frontend creation, deployment work, or other broad changes, create and maintain an execution plan before implementation.

Use `PLANS.md` as the execution-plan standard.

The plan must define:

- current state
- desired outcome
- affected files
- milestones
- validation commands
- risks
- decisions
- progress