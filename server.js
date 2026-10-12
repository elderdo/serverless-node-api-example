// 1. ENVIRONMENT CONFIGURATION
// Loads the private ".env" file into process.env (PORT, JWT_SECRET, ...).
require("dotenv").config();

// 2. IMPORTS
const express = require("express");
const path = require("path");
const {
  handleRegister,
  handleLogin,
  AuthError,
} = require("./src/auth-handler");
const requireAuth = require("./src/middleware/requireAuth");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Max 10 attempts per 15 minutes per IP on the auth routes.
//
// skip: tells the limiter to bypass its request-count
// check when Jest runs with NODE_ENV=test.
// It belongs in the limiter configuration,
// not in the test file,
// because the limiter is shared by
// the /register and /login routes.
//
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
  skip: () => process.env.NODE_ENV === "test",
});

// 3. INITIALIZE THE APP
const app = express();
const PORT = process.env.PORT || 3000;

// 4. MIDDLEWARE

// helmet sets a bundle of HTTP response headers
// that switch on browser protections
// (against clickjacking, content sniffing, and so on).
// It is one line and a standard Express practice.
app.use(helmet());

// Only these origins may call the API from a browser. Add your front end's address.
if (process.env.CORS_ORIGIN) {
  const allowedOrigins = process.env.CORS_ORIGIN.split(",").map((origin) =>
    origin.trim(),
  );

  app.use(cors({ origin: allowedOrigins }));
}

// Parses JSON request bodies into req.body.
app.use(express.json());

// Serves the files in /public (the HTML test page at http://localhost:PORT/).
app.use(express.static(path.join(__dirname, "public")));

// Shared validation for register/login bodies.
const validateCredentials = (req, res, next) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }
  if (typeof username !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ error: "Username and password must be strings" });
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
app.post("/register", authLimiter, validateCredentials, async (req, res) => {
  const { username, password } = req.body;
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });
  }
  try {
    const user = await handleRegister(username, password);
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    return sendError(res, error, "Failed to register user");
  }
});

// POST /login - exchange credentials for a JWT. Body: { username, password }
app.post("/login", authLimiter, validateCredentials, async (req, res) => {
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
