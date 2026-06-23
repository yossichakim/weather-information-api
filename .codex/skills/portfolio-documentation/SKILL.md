---
name: portfolio-documentation
description: Create, improve, audit, and maintain concise, professional, portfolio-ready software documentation verified against the repository. Use for repository READMEs, architecture documentation, deployment documentation, local setup, environment-variable references, validation commands, API documentation links, production architecture, and audits for accuracy, duplication, missing information, or unsupported claims.
---

# Portfolio Documentation

## Purpose

Produce documentation that makes a real software project understandable to recruiters, engineers, reviewers, and future maintainers. Balance portfolio presentation with technical accuracy. Prefer concise, high-signal documentation over long generic prose.

## When to Use

Use this skill when:

- Creating or improving a repository README.
- Writing architecture documentation.
- Writing deployment documentation.
- Documenting local setup, environment variables, validation commands, API documentation links, or production architecture.
- Auditing existing documentation for accuracy, duplication, missing information, or unsupported claims.

## Mandatory Repository Inspection

Before writing documentation, inspect:

- `AGENTS.md` and all applicable repository instructions.
- README files and existing documentation.
- `package.json` files and package scripts.
- `.env.example` files; never inspect real `.env` files.
- OpenAPI files or other formal API contracts.
- Database schemas and migration configuration.
- Backend and frontend entry points.
- Authentication, API client, database, and deployment configuration.
- Automated tests and test configuration.
- Existing execution plans.
- The current Git branch and working-tree status.

Inspect only the files needed to establish repository facts. Respect more specific repository instructions and stop if existing changes overlap the requested documentation files.

## Evidence Hierarchy

Verify every technical claim from repository evidence. Use this evidence order:

1. Source code and configuration.
2. Automated tests.
3. OpenAPI or other formal contracts.
4. Environment examples.
5. Execution plans.
6. User-provided production URLs or deployment facts.

Resolve conflicts in favor of the strongest current evidence, and report unresolved inconsistencies. Treat plans as intent unless implementation confirms completion. Treat user-provided deployment facts as valid only for facts the repository cannot independently establish, and identify them as user-provided when relevant.

Never invent:

- Features.
- Test counts.
- Coverage percentages.
- Performance claims.
- Scalability claims.
- Security guarantees.
- Deployment status.
- Production URLs.
- Screenshots.
- Badges.
- Metrics.
- Technologies not present in the repository.

## Strict Documentation-Only Boundary

When the requested task is documentation-only:

- Do not modify application source code.
- Do not modify backend or frontend behavior.
- Do not modify routes, controllers, services, middleware, components, styles, API clients, database schemas, migrations, tests, OpenAPI contracts, package files, lockfiles, deployment configuration, `AGENTS.md`, or `PLANS.md`.
- Do not install or remove dependencies.
- Do not run formatting tools that rewrite source files.
- Do not inspect or edit real `.env` files.
- Do not commit, push, merge, create pull requests, or deploy unless explicitly requested.
- If documentation work reveals a code or configuration problem, report it separately instead of fixing it.
- Stop before modifying any file outside the explicit documentation allowlist.

Treat any accidental source, test, contract, dependency, or configuration change as a task failure. Revert only changes created by the current task; never discard unrelated user work.

## Documentation Allowlist

Require the task prompt to define an explicit documentation allowlist before editing. If no allowlist is provided, ask for one before modifying files.

Typical permitted paths include:

- `README.md`
- `docs/architecture.md`
- `docs/deployment.md`
- Other explicitly requested Markdown files

Files not named in the allowlist must remain unchanged. Interpret directory-level permission narrowly unless the task explicitly authorizes all documentation files under that directory.

## Documentation Architecture

Avoid duplicating the same content across multiple files. Assign each fact to the most appropriate source:

- Use `README.md` for the project overview, verified live links, major features, stack, quick start, validation commands, and portfolio value.
- Use OpenAPI for endpoint-level request and response contracts.
- Use architecture documentation for boundaries, data flow, component responsibilities, authentication flow, and persistence.
- Use deployment documentation for hosting, environment variables, build commands, migrations, health checks, CORS, redeployment, and troubleshooting.
- Use separate development documentation only when setup complexity justifies it.

Link to the authoritative detail instead of copying it. Keep unavoidable summaries short and consistent.

## Portfolio README Standard

Create a professional README suitable for a serious engineering portfolio. Normally include:

- A clear project title.
- A concise one-paragraph product and engineering overview.
- Verified live application, API, Swagger, or documentation links.
- A high-signal feature summary.
- A technology stack grouped by responsibility.
- A concise architecture overview.
- Repository structure only when it adds clarity.
- Local setup instructions.
- Safe environment-variable names with placeholders only.
- Validation commands.
- Links to deeper technical documentation.
- A concise section describing the engineering skills demonstrated.

Apply these quality rules:

- Make the first screen useful.
- Put verified live links near the top.
- Avoid excessive badges.
- Avoid emoji-heavy presentation.
- Avoid marketing exaggeration.
- Avoid large, repetitive feature lists.
- Avoid full endpoint duplication when OpenAPI exists.
- Avoid generic phrases such as "cutting-edge," "enterprise-grade," or "highly scalable" unless repository evidence proves them.
- Do not add a screenshot section unless a real tracked screenshot exists and is verified.
- Prefer clean headings, short paragraphs, compact tables, and focused lists.
- Use professional English unless another language is explicitly requested.

## Architecture Documentation Standard

Explain:

- System context.
- Request and data flow.
- Frontend and backend boundaries.
- Backend layering.
- Authentication and authorization.
- Database access and ownership rules.
- External service integration.
- Important design decisions.
- Operational boundaries and known limitations.

Use at most one concise Mermaid diagram unless additional diagrams are explicitly justified. Ensure every node, boundary, and flow matches the actual implementation. Do not turn architecture documentation into a source-code walkthrough.

## Deployment Documentation Standard

Explain:

- Actual hosting providers and service types.
- Production request flow.
- Build and start commands.
- Database migration behavior.
- Required environment-variable names.
- Pooled versus direct database connections when relevant.
- CORS configuration.
- The health-check endpoint.
- Deployment order.
- Redeployment workflow.
- Common production failures and focused troubleshooting.

Never include:

- Real connection strings.
- Passwords.
- JWT secrets.
- API keys.
- Secret screenshots.
- Copied environment values.

If deployment facts are unavailable, state what is unverified instead of presenting a hypothetical deployment as current.

## Writing Quality

Write documentation that is:

- Factual.
- Concise.
- Scannable.
- Technically precise.
- Consistent in terminology.
- Free of unnecessary repetition.
- Understandable without reading the entire source code.
- Detailed enough for an engineer to run and evaluate the project.
- Polished enough for a recruiter or hiring manager.

Avoid:

- Filler introductions.
- Tutorial-style explanations of basic technologies.
- Walls of text.
- Oversized tables.
- Redundant sections.
- Claims that cannot be verified.
- Excessive implementation detail in the README.

## Security and Privacy

- Never print, copy, summarize, or expose real secrets.
- Never inspect or edit real `.env` files.
- Use only `.env.example` files and safe placeholder values.
- Do not place sensitive values in Markdown, Mermaid diagrams, examples, terminal output, or final reports.
- Treat connection strings and deployment dashboards as sensitive.
- Redact a sensitive value immediately if it appears unexpectedly in inspected output, and do not repeat it.

## Workflow

### Phase 1: Preflight

- Inspect repository instructions, the current branch, working-tree status, existing documentation, and the requested allowlist.
- Confirm that every intended output path is allowlisted.
- Stop if unrelated working-tree changes overlap an allowlisted file.

### Phase 2: Repository Fact Map

- Build an internal fact map of verified technologies, features, routes, scripts, tests, deployment components, environment variables, and limitations.
- Record the evidence source for claims likely to appear in documentation.
- Mark facts as verified, user-provided, conflicting, or unavailable.

### Phase 3: Documentation Plan

- Decide what belongs in the README, architecture documentation, deployment documentation, development documentation, or OpenAPI.
- Remove duplication before writing.
- Preserve existing authoritative sources and link to them.

### Phase 4: Writing

- Create or update only allowlisted documentation files.
- Preserve useful existing material.
- Prefer focused revision over unnecessary replacement.
- Keep terminology and commands consistent across files.

### Phase 5: Verification

- Re-check every technical claim against repository evidence.
- Check Markdown structure.
- Check relative links.
- Check commands against package scripts and actual directories.
- Check URLs only when supplied or verified.
- Check that no secrets appear.
- Check that no source or configuration file changed.

### Phase 6: Git Review

Run:

```bash
git diff --check
git diff --stat
git diff -- <all allowlisted documentation paths>
git status --short
```

Review the output and confirm that every changed path is allowlisted.

## Validation Rules

For documentation-only changes:

- Do not claim application tests passed unless they were actually run.
- Do not require expensive test suites when no code changed unless the user explicitly requests them.
- Validate documented commands against `package.json` files and repository structure.
- Report unavailable checks honestly.
- Ensure every changed file is inside the allowlist.
- Treat any source-code change as a task failure.

Use lightweight, read-only checks appropriate to the files, such as Markdown structure review, link-path verification, YAML parsing when relevant, and `git diff --check`.

## Final Report

Include:

- Documentation files created or updated.
- Files inspected.
- Validation commands executed.
- Checks that passed.
- Checks that failed or were unavailable.
- Facts that could not be verified.
- Confirmation that no application code or configuration was changed.
- Confirmation that no commit or push was performed unless explicitly requested.

Do not claim checks, facts, or outcomes that were not observed.

## Definition of Done

A documentation task is complete only when:

- All claims are repository-backed.
- The README is portfolio-ready and not overloaded.
- Deeper documentation has clear responsibilities.
- Duplication is minimized.
- Links and commands are checked.
- No secrets are exposed.
- No application code, tests, contracts, dependencies, or configuration changed.
- Git diff contains only allowlisted documentation files.
- The final report is accurate.
