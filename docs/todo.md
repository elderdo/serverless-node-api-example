# To-Do and Goals

Prioritized: easy first, then harder, then nice to have. Check items off with `- [x]`. Related guides: [testing.md](testing.md), [database.md](database.md), [configuration.md](configuration.md).

## Priority 1: Easy (an hour or two each)
- [ ] Add CORS (`cors` package) so browser apps on another port can call the API
- [ ] Add security headers (`helmet`)
- [ ] Rate-limit `/login` and `/register` (`express-rate-limit`)
- [ ] Add a GitHub Actions workflow that runs `npm test` on every push
- [ ] Clean up the old benchmark files (`.github/workflows/benchmark.yml`, `scripts/run_benchmark.py`), which target the previous secrets-scanner setup
- [ ] Add ESLint and Prettier

## Priority 2: Harder (a day or more each)
- [ ] **PostgreSQL persistence**: run Postgres locally, create the `users` table, rewrite [src/db/users.js](../src/db/users.js) with async `pg` queries, use a separate test database, keep SQL migrations in the repo
- [ ] **Playwright end-to-end test** for the HTML page (register, login, call `/me`)
- [ ] **OpenAPI/Swagger spec** for the API, so every client (JS or C#) has one contract
- [ ] **First real front end**: one JS client in `clients/` (Vue recommended; React is the other good choice). Login and register forms, token storage, a protected page. Add Vitest and Testing Library for its tests
- [ ] **Refresh tokens and logout/revocation** so access tokens can stay short (needs the database)
- [ ] **Deploy to AWS Lambda**: `serverless-http` wrapper, a `serverless.yml`, RDS for Postgres, secrets in AWS Secrets Manager or SSM

## Priority 3: Nice to have
- [ ] Additional clients to compare, each in its own `clients/` folder: Angular, C# Blazor (WebAssembly or Server), ASP.NET Core MVC / Razor Pages (generate a typed C# client from the OpenAPI spec)
- [ ] Password reset and email verification
- [ ] Stripe: a `POST /charge` route behind `requireAuth`, using Payment Intents (the current `charges.create` helper is a legacy API) and webhooks
- [ ] Input validation library (such as `zod`) once there are more routes
- [ ] Try Cypress as an alternative to Playwright (pick one, not both)
- [ ] Coverage thresholds in Jest (`npx jest --coverage`)
