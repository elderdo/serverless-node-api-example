# Serverless Node.js API Example

A small, beginner-friendly Node.js + Express API with user registration, login, and token-protected routes. It is built as a learning project and a starting point for adding a database (PostgreSQL), payments (Stripe), and AWS Lambda deployment.

## Features
- **Registration and login** with bcrypt-hashed passwords.
- **JWT authentication**: login returns a token that unlocks protected routes.
- **Example protected route** (`GET /me`) using reusable middleware.
- **Secrets kept out of code**: all configuration comes from `.env`.
- **Automated tests** with Jest and supertest.
- Stripe, PostgreSQL, and AWS modules are included but not yet wired to routes.

## Endpoints

| Endpoint | Method | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `/health` | GET | none | Is the server up? |
| `/register` | POST | none | Create an account: `{ "username", "password" }` (min 8 chars). |
| `/login` | POST | none | Returns a JWT valid for 2 hours. |
| `/me` | GET | Bearer token | Returns the logged-in username. |

## Getting Started

```bash
npm install
cp .env.example .env      # PowerShell: Copy-Item .env.example .env
```

Open `.env` and set at least `JWT_SECRET` and `STRIPE_SECRET_KEY` (see [docs/configuration.md](docs/configuration.md) for how to generate them). Then:

```bash
npm start                 # starts on http://localhost:8000 (or your PORT)
npm test                  # runs the test suite
```

Try it (new to curl? See [docs/using-curl.md](docs/using-curl.md) for what each part means, how to install curl, and Windows PowerShell tips):

```bash
# 1. Create an account (-X POST = send data, -H = header, -d = the JSON body)
curl -X POST http://localhost:8000/register -H "Content-Type: application/json" -d '{"username":"alice","password":"password123"}'
# 2. Log in; the response contains a token (your session pass)
curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d '{"username":"alice","password":"password123"}'
# 3. Call a protected route by sending the token in the Authorization header
curl http://localhost:8000/me -H "Authorization: Bearer <token from login>"
```

## Test in the browser (no curl needed)

Start the server (`npm start`) and open **http://localhost:8000/** (your `PORT`). The page in [public/index.html](public/index.html) has buttons for health check, register, login, and `/me`, and it fills in your token automatically after login. It is plain HTML and JavaScript: no React, Angular, or build step.

## Project Layout

| Path | Role |
| :--- | :--- |
| [server.js](server.js) | Entry point: routes, validation, error handling. |
| [src/auth-handler.js](src/auth-handler.js) | Registration and login logic. |
| [src/middleware/requireAuth.js](src/middleware/requireAuth.js) | Protects routes with a bearer token. |
| [src/utils/token.js](src/utils/token.js) | Creates and verifies JWTs. |
| [src/db/users.js](src/db/users.js) | In-memory user store (swap for PostgreSQL later). |
| [src/db/connect.js](src/db/connect.js) | Reads `DATABASE_URL`. |
| [src/services/stripe.js](src/services/stripe.js) | Stripe client. |
| [src/config/aws.js](src/config/aws.js) | AWS settings. |
| [public/index.html](public/index.html) | Browser test page (plain HTML). |
| [tests/api.test.js](tests/api.test.js) | API tests. |

## Documentation
- [Architecture overview](docs/architecture-overview.md): how the pieces fit together, pros and cons, next steps.
- [Configuration guide](docs/configuration.md): every `.env` variable explained.
- [Using curl](docs/using-curl.md): installing curl and trying each endpoint step by step.
- [Database guide](docs/database.md): do you need PostgreSQL, and how to run one locally.
- [JavaScript cheatsheet](docs/JavaScript/logic-cheatsheet.md), [understanding undefined](docs/JavaScript/understanding_undefined.md), [validation notes](docs/User-Validation/validation_and_dynamics.md).

Code files carry short beginner-oriented comments explaining what each part does and why.

## Current Limitations
- Runs as a regular Express server. It is **not yet deployable to AWS Lambda** (needs an adapter such as `serverless-http` and a `serverless.yml`).
- Users are stored in memory and are lost on restart. **PostgreSQL is not needed to run the app today.** See [docs/database.md](docs/database.md) for when and how to set it up locally.
- No rate limiting, email verification, or password reset.

## Secrets Scanning History
This project began as a secrets-scanner benchmark containing fake credentials. Those hardcoded values (AWS keys, a Stripe key, a database URL, a JWT secret, and a GitHub token) have been removed from the code and from git history, because GitHub push protection blocks them and they are bad practice. If you still want to benchmark scanners, keep such fixtures in a separate repository.

## License
MIT License.
