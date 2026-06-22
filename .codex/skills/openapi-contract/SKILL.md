---
name: openapi-contract
description: Create, audit, and maintain the Express API's professional OpenAPI 3.1 contract in backend/openapi.yaml, including Swagger UI, raw-document serving, route-to-contract verification, reusable schemas and responses, JWT security, examples, and documentation-route tests. Use when adding or changing API documentation, documenting health, authentication, weather, or task routes, reconciling OpenAPI with Express implementation, or verifying documentation endpoints.
---

# OpenAPI Contract

Maintain an implementation-derived OpenAPI contract. Treat the Express routes, middleware, controllers, services, validation, and tests as evidence; never infer unsupported endpoints, fields, status codes, or behavior.

## Workflow

1. Inspect the repository instructions, `backend/openapi.yaml` if present, Express application setup, mounted routers, route modules, validation, controllers, services, error handling, and relevant tests.
2. Build a private route inventory containing each method, full mounted path, authentication requirement, parameters, request body, success response, and implemented error responses.
3. Compare the route inventory with the OpenAPI paths. Resolve mismatches from source evidence; do not make the application conform to guessed documentation.
4. Create or update only the documentation integration, contract, and directly relevant automated tests requested by the task.
5. Run focused checks, the backend test suite, and any OpenAPI parser or validator available in the repository.
6. Inspect the final diff and status. Report changed files, commands, passes, failures, and any contract gaps. Never commit or push automatically.

## Contract Requirements

- Keep exactly one OpenAPI source of truth at `backend/openapi.yaml`.
- Use OpenAPI 3.1.x and valid 3.1 schema semantics.
- Define reusable component schemas for repeated domain models, request bodies, and error payloads.
- Define reusable responses for repeated errors or outcomes. Reference components instead of duplicating structures.
- Define bearer JWT authentication under `components.securitySchemes` using HTTP `bearer` with `bearerFormat: JWT`.
- Apply security only to routes that the Express implementation actually protects. Keep registration, login, health, and other public routes unsecured when source evidence shows they are public.
- Document all implemented health, authentication, current-weather, and task CRUD endpoints.
- Document implemented task-list query parameters for `status` and `category`, including their actual names, locations, optionality, allowed values, and behavior.
- Include realistic request and response examples that conform exactly to the implemented schemas.
- Document `400`, `401`, `404`, `409`, and `500`-style errors where each is applicable in the implementation. Do not add a status merely to make the contract appear complete.
- Document validation constraints, required fields, formats, enums, nullability, and pagination or filtering behavior only when verified in source.
- Preserve existing API paths unless the user explicitly requests an API migration.

## Documentation Serving

- Serve Swagger UI from the Express backend at a stable documented route.
- Serve the raw OpenAPI document from a separate stable endpoint with an appropriate response content type.
- Load both routes from `backend/openapi.yaml`; do not maintain an inline or generated second contract.
- Keep documentation setup compatible with the backend's existing ES-module architecture and application composition.
- Avoid exposing secrets, environment values, real tokens, or private credentials in examples.

## Verification

- Trace every documented operation to its mounted Express route, including router prefixes.
- Trace documented fields and examples to controller output, service results, Prisma selection or serialization, validation schemas, and tests.
- Check that parameter names, request shapes, response envelopes, status codes, and authentication requirements match the implementation.
- Check that every implemented in-scope route is documented and every documented route exists.
- Add or maintain at least one automated Supertest/Vitest test proving that the Swagger UI route and raw OpenAPI document route respond successfully. Prefer assertions that also verify the raw document is parseable and declares OpenAPI 3.1 when practical.
- Run `npm test` from `backend/` or the equivalent root workspace command after backend documentation integration or test changes.
- Treat unavailable dependencies, validators, or tests as reported limitations; do not claim verification that did not run.

## Change Safety

- Preserve existing behavior unless the task explicitly requests a behavior change.
- Keep authenticated task operations scoped to the authenticated user when documentation or tests touch task behavior.
- Do not edit `.env` files or place real secrets in the contract.
- Do not modify unrelated files.
- Do not commit or push unless the user explicitly requests it.
