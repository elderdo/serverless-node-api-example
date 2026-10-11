// 1. ENVIRONMENT CONFIGURATION
// This loads your hidden ".env" file. It processes variables like your PORT=8000
// and database strings, making them safely accessible via "process.env".
require("dotenv").config();

// 2. IMPORT FRAMEWORKS & FILES
// Express is a minimalist framework used to build web servers and APIs in Node.js.
const express = require("express");

// This reaches into your local "src" folder and extracts the "handleLogin" function
// that contains your core business and token-generation logic.
const { handleLogin } = require("./src/auth-handler");

// 3. INITIALIZE THE SERVER ENGINE
// This fires up a brand new instance of an Express web application server.
const app = express();

// This reads your chosen port (8000) from the .env file.
// If the .env file vanishes or lacks a port, the "||" acts as a fallback to port 3000.
const PORT = process.env.PORT || 3000;

// 4. MIDDLEWARE SETUP
// By default, Express doesn't understand raw JSON text sent to it in request bodies.
// This line acts as a translator, automatically parsing incoming JSON data packets
// so your endpoints can easily read them inside "req.body".
app.use(express.json());

// 5. ENDPOINT 1: THE HEALTH CHECK (GET Request)
// A "GET" request means someone is asking to read or view a page.
// When a browser visits /health, we simply reply with a quick status check and a timestamp.
app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date() });
});

// 6. ENDPOINT 2: USER LOGIN (POST Request)
// A "POST" request means someone is securely submitting or sending data to the server.
// The "req" (Request) object holds data coming IN from the user.
// The "res" (Response) object holds data we are preparing to send OUT to the user.
app.post("/login", (req, res) => {
  // Unpack the incoming data packet to extract the "username" text submitted by the user.
  const { username } = req.body;

  // VALIDATION: If the user left the username field blank, stop immediately!
  // Send back a HTTP 400 Bad Request error status code along with a helpful message.
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  // EXECUTION: Try to run the core login/token machine safely.
  try {
    // Pass the username to our authentication engine to generate the secure JWT session pass.
    const sessionData = handleLogin(username);

    // Send back a successful HTTP 200 response with a JSON payload containing the session data.
    return res.json({
      success: true,
      message: `User ${username} logged in successfully!`,
      data: sessionData, // This contains the long encrypted string you saw in your terminal!
    });
  } catch (error) {
    // CRASH PROTECTION: If anything inside the handleLogin logic fails (e.g. database down),
    // catch the error here so the entire server doesn't crash, and notify the user with a 500 error.
    return res.status(500).json({ error: "Failed to generate auth token" });
  }
});

// 7. BOOT UP LISTENER
// This tells the server to actually lock onto port 8000 and start listening for web traffic.
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
