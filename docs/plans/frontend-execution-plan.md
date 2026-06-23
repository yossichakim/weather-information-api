# Contract-Driven React Frontend Execution Plan

## Current State

- The repository contains a completed Express, Prisma, PostgreSQL, JWT, weather, and task backend under `backend/`.
- `backend/openapi.yaml` is the verified OpenAPI 3.1 source of truth.
- The backend exposes public authentication and current-weather endpoints plus bearer-protected task CRUD.
- The backend does not configure browser CORS, so local frontend development must use a Vite `/api` proxy.
- No tracked `frontend/` application exists.
- Baseline backend validation passed on June 22, 2026: 1 test file and 9 tests passed.

## Desired Outcome

Create a production-style React, Vite, and TypeScript application under `frontend/` that:

- integrates only with documented backend endpoints and response shapes
- supports registration, login, logout, and session restoration
- keeps public current-weather search available without authentication
- supports complete authenticated task CRUD and combined filters
- presents deliberate loading, empty, success, validation, authentication, and server-error states
- provides a distinctive atmospheric weather-operations interface
- remains accessible and responsive from narrow mobile to wide desktop layouts
- passes lint, type checking, behavior tests, and production build validation

## Affected Files

- Create `frontend/` source, configuration, tests, package metadata, and safe environment example.
- Create and maintain this execution plan.
- Preserve `PLANS.md`, backend source, Prisma files, migrations, OpenAPI behavior, and real environment files.

## Frontend Architecture

- Use a single-screen application composed from authentication, weather, and task features.
- Keep contract-derived domain types in `src/types/`.
- Keep session storage, request construction, bearer authorization, response parsing, error normalization, and status conversion in `src/api/`.
- Use a small authentication context because session identity and authentication-loss handling are shared across the header and task workspace.
- Keep feature state close to feature components.
- Use reusable primitives only for controls and states that recur across features.

## API Integration

- Default `VITE_API_BASE_URL` to `/api`.
- Proxy `/api` to `http://localhost:3000` during Vite development.
- Use native `fetch` through one API client.
- Normalize non-success responses, invalid response bodies, and network failures into one `ApiError` structure.
- Send bearer tokens only for protected requests.
- Convert task response statuses (`PENDING`, `CHECKED`) to request/filter values (`pending`, `checked`) in one API mapping module.

## Authentication Lifecycle

1. Read the access token through the session abstraction.
2. If present, restore the user with `GET /api/auth/me` while showing a restoring-session state.
3. Clear the token and user on any protected `401`.
4. Register through `POST /api/auth/register` without inventing a session.
5. Login through `POST /api/auth/login`, then persist only the returned access token.
6. Logout through `DELETE /api/auth/logout`, then clear local state even if the remote token is already invalid.

## Weather Workflow

- Validate and trim the city before requesting `GET /api/weather/current`.
- Represent initial, loading, success, city-not-found, provider-error, and general-error states.
- Display only contract fields.
- Derive restrained visual accents from returned primary conditions.
- Permit retrying the last valid city search.

## Task Workflow

- Require authentication before loading or mutating tasks.
- Load tasks with optional status and category query parameters.
- Support create, full-field edit, status toggle, delete confirmation, refresh, combined filters, and filter clearing.
- Respect the 120-character title maximum.
- Normalize optional description and city values.
- Use `general` when category input is blank.
- Refresh the server-owned task list after mutations to keep filtering and ordering authoritative.

## Design System

- Define CSS variables for atmospheric surfaces, text, accents, semantic states, borders, shadows, spacing, typography, radii, and motion.
- Use a restrained header, prominent weather hero, and focused task workspace.
- Use custom button, field, panel, badge, spinner, alert, empty-state, and confirmation-dialog primitives where repetition justifies them.
- Use CSS gradients and ambient layers without external photography.

## Responsive Strategy

- Use a wide two-column dashboard composition when space permits.
- Stack weather before tasks on smaller screens.
- Allow task controls and forms to wrap without horizontal overflow.
- Keep controls at touch-friendly dimensions and avoid compressed desktop sidebars.

## Accessibility Strategy

- Use semantic header, main, sections, forms, lists, and dialogs.
- Preserve logical heading order and explicit labels.
- Provide visible focus, keyboard operation, descriptive control names, and text alongside status color.
- Announce asynchronous feedback through appropriate live regions.
- Restore focus after dialog closure and support `prefers-reduced-motion`.

## Testing Strategy

- Use Vitest, React Testing Library, user-event, and MSW.
- Test API error normalization independently.
- Test user-observable authentication, session restoration, weather, task, filtering, mutation, and authentication-loss behavior.
- Keep mocked payloads valid against `backend/openapi.yaml`.

## Milestones

1. Complete preflight and baseline backend validation.
2. Create the frontend plan and project foundation.
3. Implement typed API and session architecture.
4. Implement authentication, weather, task, and shared UI features.
5. Add focused behavior tests.
6. Run frontend validation, backend regression tests, browser checks when tooling permits, and final repository audit.

## Validation Commands

From `frontend/`:

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd run build`

From `backend/`:

- `npm.cmd test`

Repository audit:

- `git diff --check`
- `git diff`
- `git status --short`
- tracked secret, database, dependency, and build-output checks

## Risks

- Separate-origin production hosting requires an explicitly scoped backend CORS change.
- Weather success depends on a valid server-side OpenWeather API key and provider availability.
- Access tokens are bearer credentials; local storage is used only because the current contract provides no cookie session.
- Browser-level verification depends on available browser tooling and a working local weather-provider configuration.

## Decisions

- Keep the application single-screen and avoid a routing dependency.
- Use React context only for authentication/session state.
- Use MSW for fetch-compatible request mocking.
- Keep task filters server-driven to match backend semantics.
- Do not generate types automatically from OpenAPI because the application requires a small, explicit contract surface and no generation dependency.

## Progress

- [x] Complete repository and contract inspection.
- [x] Confirm `portfolio-upgrade` and safe working-tree scope.
- [x] Run baseline backend tests: 9 passed.
- [x] Create the frontend execution plan.
- [x] Create the React/Vite/TypeScript foundation.
- [x] Implement API and session architecture.
- [x] Implement authentication.
- [x] Implement weather search.
- [x] Implement task CRUD and filters.
- [x] Add accessibility and responsive styling.
- [x] Add required behavior tests: 4 files and 18 tests passed.
- [x] Run lint, typecheck, tests, production build, backend regression tests, local proxy smoke checks, and repository audit.
