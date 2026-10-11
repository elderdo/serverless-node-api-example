// 1. ENVIRONMENT CONFIGURATION
// Loads the private ".env" file into process.env (PORT, JWT_SECRET, ...).
require("dotenv").config();

// 2. IMPORTS
const express = require("express");
const path = require("path");
const { handleRegister, handleLogin, AuthError } = require("./src/auth-handler");
const requireAuth = require("./src/middleware/requireAuth");

// 3. INITIALIZE THE APP
const app = express();
const PORT = process.env.PORT || 3000;

// 4. MIDDLEWARE
// Parses JSON request bodies into req.body.
app.use(express.json());

// Serves the files in /public (the HTML test page at http://localhost:PORT/).
app.use(express.static(path.join(__dirname, "public")));

// Shared validation for register/login bodies.
const validateCredentials = (req, res, next) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Username and password must be strings" });
  }
  return next();
};

// Turns AuthError (409, 401) into proper responses; anything else is a 500.
const sendError = (res, error, fallback) => {
  if (error instanceof AuthError) {
    return res.status(error.status).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
};

// 5. ROUTES
// GET /health - is the server up?
app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date() });
});

// POST /register - create an account. Body: { username, password }
app.post("/register", validateCredentials, async (req, res) => {
  const { username, password } = req.body;
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  try {
    const user = await handleRegister(username, password);
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    return sendError(res, error, "Failed to register user");
  }
});

// POST /login - exchange credentials for a JWT. Body: { username, password }
app.post("/login", validateCredentials, async (req, res) => {
  const { username, password } = req.body;
  try {
    const session = await handleLogin(username, password);
    return res.json({ success: true, data: session });
  } catch (error) {
    return sendError(res, error, "Failed to log in");
  }
});

// GET /me - example protected route. Needs "Authorization: Bearer <token>".
app.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

// 6. START THE SERVER
// Only listen when run directly (npm start); tests import `app` without a port.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
