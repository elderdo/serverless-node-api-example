// DATABASE CONFIG (not used by any route yet)
// This is where the PostgreSQL connection string will come from when you
// replace the in-memory store in users.js with a real database.
// Format: postgres://USER:PASSWORD@HOST:5432/DATABASE
// Set DATABASE_URL in .env (see docs/configuration.md). The old hardcoded
// production string was removed so credentials never live in source code.
const dsn = process.env.DATABASE_URL;
if (!dsn) {
    throw new Error('DATABASE_URL is not set. Add it to your .env file.');
}

module.exports = { dsn };
