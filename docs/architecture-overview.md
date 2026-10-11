# Architecture Overview (Beginner Friendly)

This project is a small **Node.js web API**. A client (a browser, `curl`, a mobile app) sends HTTP requests, and the server replies with JSON.

## What it does today

| Endpoint | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/health` | GET | none | Reports that the server is up. |
| `/register` | POST | none | Creates an account from `{ "username", "password" }` (password min 8 chars). Returns 201, or 409 if the name is taken. |
| `/login` | POST | none | Checks the password and returns a JWT valid for 2 hours. Returns 401 on bad credentials. |
| `/me` | GET | Bearer token | Example protected route; returns the logged-in username. |

Try it:

```bash
npm start
curl -X POST http://localhost:8000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"password123"}'
curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"password123"}'
curl http://localhost:8000/me -H "Authorization: Bearer <token from login>"
```

Run the tests with `npm test`.

## How a request flows

```
Client
  |  POST /register or /login
  v
server.js (Express)            <- routes, JSON parsing, validation, error handling
  |  handleRegister / handleLogin
  v
src/auth-handler.js            <- business logic: hash/check passwords (bcryptjs)
  |            |
  v            v
src/db/users.js   src/utils/token.js   <- user store (in memory) / JWT signing

Protected routes: src/middleware/requireAuth.js verifies the token first.
```

## Folder map

| Path | Role |
| :--- | :--- |
| `server.js` | Entry point. Loads `.env`, defines routes. Exports `app` for tests. |
| `src/auth-handler.js` | Registration and login logic. |
| `src/middleware/requireAuth.js` | Rejects requests without a valid bearer token. |
| `src/utils/token.js` | Creates and verifies JWTs. |
| `src/db/users.js` | In-memory user store (lost on restart). Swap for PostgreSQL later. |
| `src/db/connect.js` | Exposes `DATABASE_URL` for the future database step. |
| `src/services/stripe.js` | Stripe client and `chargeCustomer` helper (not wired to a route yet). |
| `src/config/aws.js` | AWS SDK settings (not used yet). |
| `tests/api.test.js` | Jest + supertest tests for all endpoints. |
| `.env` / `.env.example` | Configuration and secrets. `.env` is private and gitignored. |
## Key concepts

- **Express**: a small framework that maps URLs (routes) to functions.
- **Middleware**: code that runs on every request before your route, such as `express.json()`, which parses JSON bodies.
- **JWT (JSON Web Token)**: a signed string proving who a user is. The server signs it with `JWT_SECRET`; anyone who changes it breaks the signature.
- **Environment variables**: settings and secrets kept out of source code and loaded from `.env`. Never hardcode secrets, because Git history keeps them forever (GitHub even blocks pushes containing them).
- **Separation of concerns**: routes in `server.js`, logic in `src/`. This makes each piece easier to test and change.

## What it enables a developer to do

- Learn the basics of a REST API: routes, JSON, status codes (200/400/500), validation.
- See how token-based authentication works end to end.
- Use it as a starting point for adding database access (`pg`), payments (Stripe), and AWS services.
- Practice secret management with `.env` and secret scanning.

## Pros

- Very small and readable. The whole app can be understood in one sitting.
- Standard, popular stack (Express, JWT, bcrypt, PostgreSQL, Stripe), so skills transfer.
- Clear separation between routes, logic, middleware, and storage.
- Secrets come from the environment only; the app refuses to start without `JWT_SECRET`.
- Passwords are stored as bcrypt hashes, never in plain text.
- Fast to run locally and covered by automated tests.

## Cons / current limitations

- **Not serverless yet.** `server.js` is a regular long-running Express server. Deploying to AWS Lambda needs an adapter (for example `serverless-http`) and a `serverless.yml`.
- **Users live in memory**, so they vanish on restart and don't work across multiple Lambda instances.
- No rate limiting, email verification, password reset, or token refresh.
- Stripe, PostgreSQL, and AWS modules exist but aren't used by any route.
- The repo started as a secrets-scanner benchmark, so the README's benchmark table may not match the code anymore.

## Good next steps

1. Replace `src/db/users.js` with PostgreSQL queries using `pg` and `DATABASE_URL`.
2. Add rate limiting on `/login` and `/register`.
3. Wrap the app with `serverless-http` and add a `serverless.yml` to deploy to AWS Lambda.
4. Wire a Stripe route behind `requireAuth`.
