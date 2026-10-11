// TOKEN HELPERS
// A JWT (JSON Web Token) is a signed string the server hands out at login.
// The client sends it back on later requests to prove who they are.
// Anyone can READ a JWT's contents, but only someone with JWT_SECRET can
// create or change one, so never put sensitive data in the payload.
const jwt = require('jsonwebtoken');

// No fallback value: a default secret in source code would be public, and
// anyone could forge tokens with it. Set JWT_SECRET in .env
// (see docs/configuration.md).
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to your .env file.');
}

// How long a token stays valid. Short is safer: a stolen token stops working
// soon. Configurable via JWT_EXPIRES_IN (e.g. 15m, 1h, 7d); defaults to 15m.
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

module.exports = {
    // Signs a payload like { username } into a token that expires after JWT_EXPIRES_IN.
    generateToken: (payload) => {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },
    // Returns the payload if the token is genuine and unexpired; otherwise throws.
    verifyToken: (token) => {
        return jwt.verify(token, JWT_SECRET);
    }
};
