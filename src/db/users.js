// USER STORE (in memory)
// Users are kept in a JavaScript Map, which works like a dictionary:
// key = lowercase username, value = the user object.
// Because it lives in memory, everything is lost when the server restarts.
// To keep users permanently, replace these functions with PostgreSQL queries
// (see docs/architecture-overview.md, "Good next steps").
const users = new Map();

module.exports = {
    // Returns the user, or undefined if not found. Lowercasing makes
    // "Alice" and "alice" the same account.
    findByUsername: (username) => users.get(username.toLowerCase()),

    // Saves a new user. We store the password HASH, never the password itself.
    create: (username, passwordHash) => {
        const user = { username, passwordHash, createdAt: new Date() };
        users.set(username.toLowerCase(), user);
        return user;
    },

    // Empties the store. Used by the tests to start each test fresh.
    clear: () => users.clear()
};
