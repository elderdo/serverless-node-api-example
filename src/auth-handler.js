// AUTH LOGIC
// This file holds the "business rules" for accounts. server.js handles HTTP;
// this file decides what registering and logging in actually mean.
const bcrypt = require('bcryptjs');
const { generateToken } = require('./utils/token');
const users = require('./db/users');

// An Error that also carries an HTTP status code (409, 401, ...) so server.js
// can send the right response without guessing.
class AuthError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// REGISTER: create a new account.
// bcrypt turns the password into a one-way "hash". Even if the user store
// leaked, the original passwords can't be read back. The 10 is the "cost":
// higher is slower to crack but also slower to compute.
const handleRegister = async (username, password) => {
    if (users.findByUsername(username)) {
        throw new AuthError('Username already taken', 409); // 409 = Conflict
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = users.create(username, passwordHash);
    return { username: user.username }; // never return the hash
};

// LOGIN: check the password, then hand back a JWT (a signed session pass).
// An unknown user and a wrong password give the SAME error on purpose, so an
// attacker can't use login to find out which usernames exist.
const handleLogin = async (username, password) => {
    const user = users.findByUsername(username);
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
        throw new AuthError('Invalid username or password', 401); // 401 = Unauthorized
    }
    return { token: generateToken({ username: user.username }) };
};

module.exports = { handleRegister, handleLogin, AuthError };
