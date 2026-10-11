# Database Guide

## Do I need PostgreSQL right now?

**No.** Registration and login currently use an in-memory store ([src/db/users.js](../src/db/users.js)). Nothing connects to PostgreSQL yet, so the app runs and the tests pass without it. The trade-off: users disappear every time the server restarts.

Add PostgreSQL when you want accounts to persist.

## Does it need a separate server?

PostgreSQL always runs as a **server process**, but that process can live on your own computer. For development you run it locally, and the connection string points at `localhost`. No cloud server is needed. In production you would typically use a managed one such as AWS RDS.

## Easiest ways to run it locally

| Option | Command / steps |
| :--- | :--- |
| **Docker** (cleanest, easy to delete) | `docker run --name dev-pg -e POSTGRES_PASSWORD=devpass -e POSTGRES_DB=my_local_db -p 5432:5432 -d postgres:16` |
| **Windows installer** | Download from https://www.postgresql.org/download/windows/ and create a database named `my_local_db` (pgAdmin is included). |
| **macOS** | `brew install postgresql@16 && brew services start postgresql@16 && createdb my_local_db` |
| **Ubuntu/Debian** | `sudo apt install postgresql` then `sudo -u postgres createdb my_local_db` |

Then set the matching URL in `.env`:

```
DATABASE_URL=postgres://postgres:devpass@localhost:5432/my_local_db
```

Format: `postgres://USER:PASSWORD@HOST:PORT/DATABASE`.

## Don't want to run a server at all?

SQLite stores data in a single file with no server. It's a fine alternative for a pure learning project, but this repo already includes the `pg` driver for PostgreSQL, which matches AWS RDS in production.

## Next step: persisting users

1. Create a table:
   ```sql
   CREATE TABLE users (
     username TEXT PRIMARY KEY,
     password_hash TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );
   ```
2. Rewrite `findByUsername` and `create` in [src/db/users.js](../src/db/users.js) as `pg` queries (they become `async`; `auth-handler.js` would then `await` them).
3. Keep the same function names so `auth-handler.js` and the routes need very little change.

Note: [src/db/connect.js](../src/db/connect.js) throws if `DATABASE_URL` is empty, so only import it once you are using the database.
