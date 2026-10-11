// Connection string comes from DATABASE_URL (see .env.example); the previous
// hardcoded production RDS DSN was removed.
const dsn = process.env.DATABASE_URL;
if (!dsn) {
    throw new Error('DATABASE_URL is not set. Add it to your .env file.');
}

module.exports = { dsn };
