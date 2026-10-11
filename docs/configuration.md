# Configuration Guide

The app reads its settings from **environment variables**. In development they are loaded from a file named `.env` in the project root (by `require("dotenv").config()` at the top of [server.js](../server.js)).

## Why `.env`?

Secrets (passwords, API keys) must never be written into source code. Git remembers every commit forever, and GitHub blocks pushes that contain secrets. `.env` is listed in `.gitignore`, so it stays on your machine. [.env.example](../.env.example) is the shareable template with blank values.

## Setup

```bash
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
```

Then fill in the values below.

## Variables

| Variable | Required | Used by | What it is |
| :--- | :--- | :--- | :--- |
| `PORT` | no (default 3000) | [server.js](../server.js) | Port the server listens on. |
| `NODE_ENV` | no | general | `development` or `production`. |
| `JWT_SECRET` | **yes** | [src/utils/token.js](../src/utils/token.js) | Secret used to sign login tokens. The app won't start without it. |
| `JWT_EXPIRES_IN` | no (default `15m`) | [src/utils/token.js](../src/utils/token.js) | How long a login token lasts, e.g. `15m`, `1h`, `7d`. Short lifetimes limit the damage if a token is stolen; typical access tokens last 5 to 30 minutes. When it expires, the user logs in again (refresh tokens are a future step). |
| `STRIPE_SECRET_KEY` | **yes** if `src/services/stripe.js` is loaded | [src/services/stripe.js](../src/services/stripe.js) | Stripe API key. Use a `sk_test_...` key from the Stripe dashboard (Developers, API keys). |
| `DATABASE_URL` | yes, if `src/db/connect.js` is loaded | [src/db/connect.js](../src/db/connect.js) | PostgreSQL URL: `postgres://USER:PASSWORD@HOST:5432/DATABASE`. |
| `AWS_REGION` | no (default us-east-1) | [src/config/aws.js](../src/config/aws.js) | AWS region. |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | only when using AWS | [src/config/aws.js](../src/config/aws.js) | AWS credentials. |

## Generating a good `JWT_SECRET`

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Changing the secret invalidates all existing tokens (users must log in again).

## "Fail fast" on purpose

If a required variable is missing, the app throws an error at startup with a message naming the variable. This is better than silently using a default value, which could be a publicly visible secret.
