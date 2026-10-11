// AUTH MIDDLEWARE
// Middleware is a function that runs BEFORE your route. Put it in front of any
// route that needs a logged-in user:  app.get("/me", requireAuth, handler)
// Clients must send the header:  Authorization: Bearer <token from /login>
const { verifyToken } = require('../utils/token');

module.exports = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Missing bearer token' });
    }
    try {
        // Make the decoded token available to the route as req.user.
        req.user = verifyToken(token);
        return next(); // token is good: continue to the route
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
