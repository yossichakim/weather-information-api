# Deployment

## Production Topology

The production deployment uses:

- **Render Static Site** for the React, Vite, and TypeScript frontend.
- **Render Web Service** for the Node.js and Express backend.
- **Neon PostgreSQL** for users, tasks, token revocation, and Prisma migration history.
- **OpenWeatherMap** for geocoding and current-weather data.

Production endpoints:

- Frontend: `<FRONTEND_URL>`
- Backend: <https://weather-information-api-backend.onrender.com>
- Swagger UI: <https://weather-information-api-backend.onrender.com/api/docs>
- Health check: <https://weather-information-api-backend.onrender.com/api/health>

The frontend URL is the supplied deployment placeholder. No Render infrastructure file is tracked, so service settings are configured in Render rather than from repository-managed deployment code.

## Deployment Order

1. Create the Neon PostgreSQL project and obtain pooled and direct connection credentials.
2. Create the Render backend Web Service and configure its environment variables.
3. Deploy the backend, allowing startup to apply Prisma migrations.
4. Verify `/api/health` and `/api/docs`.
5. Create the Render frontend Static Site with the backend API base configured.
6. Add the frontend origin to the backend `CORS_ORIGINS` allowlist.
7. Redeploy the backend after changing CORS configuration, then verify the frontend workflows.

## Render Service Settings

### Backend Web Service

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Node.js |
| Node version | `>=24.0.0 <25.0.0` |
| Build Command | `npm run build` |
| Start Command | `npm run start:production` |
| Health Check Path | `/api/health` |

`npm run build` runs `prisma generate`. The production start script runs `prisma migrate deploy` before `node src/server.js`, so a failed migration prevents the API process from starting.

### Frontend Static Site

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Publish Directory | `dist` |

The frontend build runs TypeScript project compilation followed by `vite build`.

## Database Connections and Migrations

Use separate Neon connection roles:

- `DATABASE_URL` is the pooled PostgreSQL connection used by the running Express application through the Prisma PostgreSQL adapter.
- `DIRECT_URL` is the direct PostgreSQL connection consumed by `prisma.config.ts` for migration commands.

Do not place either connection string in documentation, source code, logs, or frontend variables.

Prisma Client generation and migration behavior:

```text
Build:   npm run build              -> prisma generate
Startup: npm run start:production   -> prisma migrate deploy && node src/server.js
```

Deploy schema changes before relying on application code that requires them. Review migration SQL in source control, deploy the backend, verify startup and health, then deploy dependent frontend changes.

## Environment Variables

### Backend

| Variable | Required behavior |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection used by the running application |
| `DIRECT_URL` | Direct Neon connection used by Prisma migration tooling |
| `JWT_SECRET` | Secret used for HS256 token signing and verification |
| `OPENWEATHER_API_KEY` | Server-side credential for OpenWeatherMap |
| `CORS_ORIGINS` | Comma-separated list of permitted frontend origins |
| `PORT` | HTTP port supplied by Render; the server defaults to `3000` locally |

`CORS_ORIGINS` is split on commas, trimmed, and matched exactly. Requests without an `Origin` header are allowed; browser origins not in the list receive a CORS error. Configure only trusted frontend origins and omit trailing slashes so values match browser origin syntax.

`TEST_DATABASE_URL` and `SHADOW_DATABASE_URL` are documented in the backend environment example for testing and Prisma tooling, but they are not read by the production server startup path.

### Frontend

| Variable | Required behavior |
| --- | --- |
| `VITE_API_BASE_URL` | Public API base used by the centralized client |

The client removes one trailing slash and appends paths such as `/auth/login` and `/weather/current`. In production, configure the value as the backend origin plus `/api`. Do not place API keys, JWT secrets, or database credentials in any `VITE_` variable because Vite exposes them to the browser bundle.

## Redeployment Workflow

1. Review the change and any Prisma migration before deployment.
2. Run the backend tests when backend behavior or schema changed.
3. Run frontend lint, type checking, tests, and build when frontend behavior changed.
4. Deploy the backend first when API, environment, or database changes are involved.
5. Confirm the backend starts, migrations complete, the health endpoint returns success, and Swagger loads.
6. Deploy the frontend.
7. Exercise registration or login, session restoration, weather search, and user-scoped task operations.
8. Check Render logs without copying secrets or connection strings into issue reports.

Environment-only changes require redeploying the affected Render service. A `CORS_ORIGINS` change affects the backend; a `VITE_API_BASE_URL` change requires a new frontend build because Vite variables are embedded at build time.

## Troubleshooting

### CORS failures

- Confirm the browser's exact frontend origin is present in `CORS_ORIGINS`.
- Use a comma-separated list without path segments or trailing slashes.
- Redeploy the backend after changing the variable.
- Distinguish CORS rejection from a protected endpoint returning `401`.

### Incorrect frontend API base URL

- Confirm `VITE_API_BASE_URL` includes the `/api` prefix expected by frontend API modules.
- Rebuild and redeploy the Static Site after changing the variable.
- Check browser network requests for duplicated or missing path segments.

### Prisma connection failures

- Confirm `DATABASE_URL` is the pooled application connection and `DIRECT_URL` is the direct migration connection.
- Confirm both credentials target the intended Neon database and permit their required operations.
- Inspect Render and Neon status without printing connection strings.

### Migration failures

- Inspect the `prisma migrate deploy` startup output.
- Confirm the tracked migration is compatible with the target database.
- Confirm `DIRECT_URL` permits direct migration access.
- Do not bypass a failed migration by starting application code against an incompatible schema.

### OpenWeatherMap failures

- Confirm `OPENWEATHER_API_KEY` exists on the backend service.
- Check whether the failure is a city-not-found `404`, an upstream `502`, or a missing-key server error.
- Verify provider availability and account limits without exposing the key.

### Render cold starts

If the backend uses Render's Free instance type, Render spins the Web Service down after 15 minutes without inbound traffic and starts it again on the next request. The first request can therefore take longer. Retry after the health endpoint responds, and use the [Render free-instance documentation](https://render.com/docs/free#spinning-down-on-idle) and service logs to distinguish a cold start from a persistent failure.
