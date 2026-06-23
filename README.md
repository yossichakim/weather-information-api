# Atmospheric Operations

Atmospheric Operations is a full-stack weather and task management application that combines public current-weather search with a private, user-scoped planning workspace. The project demonstrates a contract-driven React frontend, a layered Express API, JWT authentication with server-side revocation, PostgreSQL persistence through Prisma, external weather integration, automated testing, and a Render deployment backed by Neon.

**Live links**

- Frontend application: `<FRONTEND_URL>`
- [Backend API](https://weather-information-api-backend.onrender.com)
- [Swagger UI](https://weather-information-api-backend.onrender.com/api/docs)
- [Health endpoint](https://weather-information-api-backend.onrender.com/api/health)

The frontend URL above is the deployment placeholder supplied for this repository. Replace it with the final Render Static Site URL when available.

## Main Features

- Search current weather by city, including temperature, humidity, conditions, and wind.
- Register, sign in, restore a session, and sign out with bearer-token authentication.
- Create, view, edit, complete, delete, and filter personal tasks.
- Keep task reads and mutations scoped to the authenticated user.
- Revoke the active access token on logout and reject revoked tokens on later requests.
- Present responsive loading, empty, success, validation, authentication, and provider-error states.

## Technology Stack

| Responsibility | Technologies |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, native `fetch`, custom CSS |
| Backend | Node.js 24, Express 5, ES modules |
| Authentication | JWT bearer tokens with `jose`, bcrypt password hashing, database-backed revocation |
| Data | PostgreSQL, Prisma ORM, Prisma PostgreSQL adapter |
| External service | OpenWeatherMap geocoding and current-weather APIs |
| API documentation | OpenAPI 3.1, Swagger UI |
| Testing | Vitest, Supertest, React Testing Library, MSW |
| Production | Render Static Site, Render Web Service, Neon PostgreSQL |

## Production Architecture

The browser loads the React application from a Render Static Site. Its centralized API client calls the Express Web Service, which validates the configured CORS allowlist and handles authentication, weather, and task requests. Weather lookups use OpenWeatherMap; users, tasks, and revoked token identifiers are stored in Neon PostgreSQL through Prisma.

See [Architecture](docs/architecture.md) for request flows and security boundaries, and [Deployment](docs/deployment.md) for production configuration and operations.

## Repository Structure

```text
backend/   Express API, Prisma schema and migrations, OpenAPI, integration tests
frontend/  React application, API client, feature modules, behavior tests
docs/      Architecture, deployment, and execution-plan documentation
```

## Local Setup

### Prerequisites

- Node.js 24
- PostgreSQL
- An OpenWeatherMap API key

### Backend

From `backend/`:

```bash
npm install
npm run build
npx prisma migrate deploy
npm run dev
```

Create `backend/.env` from `backend/.env.example` and provide local values:

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000` |
| `OPENWEATHER_API_KEY` | Server-side OpenWeatherMap credential |
| `JWT_SECRET` | Secret used to sign and verify access tokens |
| `DATABASE_URL` | Runtime PostgreSQL connection used by the application |
| `DIRECT_URL` | Direct PostgreSQL connection used by Prisma migrations |
| `CORS_ORIGINS` | Comma-separated browser origins allowed by the API |
| `TEST_DATABASE_URL` | Isolated PostgreSQL database used by backend tests |
| `SHADOW_DATABASE_URL` | PostgreSQL shadow database available to Prisma tooling |

Use placeholders or local development credentials only. Never commit the real file.

The `build` script generates Prisma Client. `prisma migrate deploy` applies the tracked PostgreSQL migration through `DIRECT_URL`; the running API uses `DATABASE_URL`.

### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Create `frontend/.env` from `frontend/.env.example` when an override is needed:

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | API prefix or absolute API base; defaults to `/api` |

Local Vite development proxies `/api` to `http://localhost:3000`, so the default works when both applications run locally.

## Validation

Run backend integration tests from `backend/`:

```bash
npm test
```

Run frontend static checks, behavior tests, and the production build from `frontend/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## API Documentation

- [Interactive Swagger UI](https://weather-information-api-backend.onrender.com/api/docs)
- [OpenAPI source](backend/openapi.yaml)

Swagger and `backend/openapi.yaml` are the endpoint-level contract. This README intentionally does not duplicate request and response schemas.

## Engineering Highlights

- Designed a REST API with implementation-aligned OpenAPI 3.1 documentation.
- Preserved clear route, middleware, controller, service, and Prisma data-access boundaries.
- Integrated OpenWeatherMap through server-side geocoding and current-weather requests.
- Implemented password hashing, one-hour JWT access tokens, authenticated identity retrieval, and token revocation.
- Enforced task ownership in database queries for list, read, update, and delete operations.
- Managed PostgreSQL schema history with Prisma migrations and separate runtime and migration connections.
- Tested API behavior with Vitest and Supertest and frontend workflows with Vitest, React Testing Library, and MSW.
- Centralized frontend transport, bearer authorization, session restoration, error normalization, and task status mapping.
- Configured separate frontend and backend production services with environment-based CORS and startup migrations.
