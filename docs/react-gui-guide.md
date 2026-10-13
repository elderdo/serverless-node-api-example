# Replacing `public/index.html` with a React GUI

A step-by-step guide for a novice React programmer. It replaces the plain HTML test page ([public/index.html](../public/index.html)) with a React app that does exactly the same four things:

1. Health check – `GET /health`
2. Register – `POST /register`
3. Log in – `POST /login` (saves the JWT token)
4. Protected route – `GET /me` (sends `Authorization: Bearer <token>`)

It also covers unit, component, and end-to-end testing.

> This guide only describes the work. No React files exist in the repo yet; you create them as you follow the steps.

---

## 0. Concepts you need first

| Term | Plain meaning |
|------|---------------|
| **Component** | A JavaScript function that returns HTML-like markup (JSX). Pieces of the screen are components. |
| **JSX** | HTML-looking syntax inside JavaScript. `class` becomes `className`, `onclick` becomes `onClick`. |
| **State** (`useState`) | A value React remembers. When it changes, React redraws the component. Replaces `document.getElementById(...).value`. |
| **Props** | Inputs passed to a component, like function arguments. |
| **Vite** | The tool that runs a React dev server and builds the final static files. |

Why this replaces the HTML file: the old page reads and writes the page directly (`$("output").textContent = ...`). In React you never touch the page directly; you change state and React updates the page.

## 1. Prerequisites

- Node.js 18+ (`node -v`)
- The API works already: `npm start` and `http://localhost:3000/health` responds.

## 2. Create the React project in a `client/` folder

Keeping the front end in its own folder keeps it separate from the API's `package.json`.

From the repository root:

```powershell
npm create vite@latest client -- --template react
cd client
npm install
```

If it asks questions, choose **React** and **JavaScript**.

Resulting layout:

```text
client/
  index.html          <- Vite's entry page (not the same as public/index.html)
  package.json        <- front-end dependencies only
  vite.config.js
  src/
    main.jsx          <- starts React
    App.jsx           <- your top-level component
```

Run it to confirm it works: `npm run dev`, open the URL shown (usually `http://localhost:5173`). Stop with Ctrl+C.

## 3. Let the dev server talk to your API (proxy)

The browser blocks calls from `localhost:5173` to `localhost:3000` unless CORS allows it. A Vite proxy forwards API calls so you do not need to change the server.

Edit `client/vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const api = "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/health": api,
      "/register": api,
      "/login": api,
      "/me": api,
    },
  },
  build: {
    outDir: "../public",   // production build goes where Express serves files
    emptyOutDir: true,     // clears old files in public/ (including old index.html)
  },
});
```

> Warning: `emptyOutDir: true` deletes everything in `public/` on every build. That is intended (it replaces `index.html`), but make sure nothing else lives there first. Commit or back up the old `index.html` before your first build; git history also keeps it.

Because the proxy only forwards the four API paths, the React page itself (`/`) is served by Vite in development.

## 4. Plan the components

```text
App                 holds shared state: token, response
 ├─ HealthCheck     button -> GET /health
 ├─ AuthForm        username/password -> register / login
 ├─ ProtectedRoute  token field -> GET /me
 └─ ResponseOutput  shows method, path, status, JSON
```

Shared state (token and the last response) lives in `App` and is passed down as props. This is called "lifting state up".

## 5. Step A – the API helper

Put network code in one plain function (easy to test). Create `client/src/api.js`:

```js
// Sends a request and returns { method, path, status, data } or { method, path, error }.
export async function call(method, path, body, token) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  try {
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return { method, path, status: res.status, data };
  } catch (err) {
    return { method, path, error: err.message };
  }
}
```

This is the same logic as `call()` in the HTML file, except it returns the result instead of writing it to the page.

## 6. Step B – `ResponseOutput`

Create `client/src/components/ResponseOutput.jsx` (create the `components` folder):

```jsx
export default function ResponseOutput({ result }) {
  let text = "Nothing yet.";
  if (result?.error) {
    text = "Request failed: " + result.error;
  } else if (result) {
    text =
      `${result.method} ${result.path}\nStatus: ${result.status}\n\n` +
      JSON.stringify(result.data, null, 2);
  }

  return (
    <>
      <h2>Response</h2>
      <pre data-testid="output">{text}</pre>
    </>
  );
}
```

`{ result }` is a prop. `result?.error` means "if `result` exists, read `error`".

## 7. Step C – `HealthCheck`

`client/src/components/HealthCheck.jsx`:

```jsx
import { call } from "../api";

export default function HealthCheck({ onResult }) {
  return (
    <fieldset>
      <legend>1. Health check (GET /health)</legend>
      <button onClick={async () => onResult(await call("GET", "/health"))}>
        Check health
      </button>
    </fieldset>
  );
}
```

`onResult` is a function passed down by `App`; calling it hands the result back up.

## 8. Step D – `AuthForm`

This is where state is used. Each input is a "controlled input": its value comes from state, and typing updates state.

`client/src/components/AuthForm.jsx`:

```jsx
import { useState } from "react";
import { call } from "../api";

export default function AuthForm({ onResult, onToken }) {
  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("password123");

  const credentials = { username, password };

  async function handleRegister() {
    onResult(await call("POST", "/register", credentials));
  }

  async function handleLogin() {
    const result = await call("POST", "/login", credentials);
    onResult(result);
    const token = result.data?.data?.token;
    if (token) onToken(token);
  }

  return (
    <fieldset>
      <legend>2. Register / 3. Log in</legend>
      <label>
        Username
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label>
        Password (min 8 characters)
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button onClick={handleRegister}>Register (POST /register)</button>
      <button onClick={handleLogin}>Log in (POST /login)</button>
    </fieldset>
  );
}
```

Note the token path `result.data.data.token`: the server replies `{ success, data: { token, ... } }` and `call()` wraps that in its own `data`.

## 9. Step E – `ProtectedRoute`

`client/src/components/ProtectedRoute.jsx`:

```jsx
import { call } from "../api";

export default function ProtectedRoute({ token, onTokenChange, onResult }) {
  return (
    <fieldset>
      <legend>4. Protected route (GET /me)</legend>
      <p>The token from a successful login is saved here automatically.</p>
      <label>
        Token
        <input
          value={token}
          placeholder="Log in first"
          onChange={(e) => onTokenChange(e.target.value)}
        />
      </label>
      <button onClick={async () => onResult(await call("GET", "/me", null, token))}>
        Call /me
      </button>
    </fieldset>
  );
}
```

## 10. Step F – assemble in `App.jsx`

Replace the contents of `client/src/App.jsx`:

```jsx
import { useState } from "react";
import HealthCheck from "./components/HealthCheck";
import AuthForm from "./components/AuthForm";
import ProtectedRoute from "./components/ProtectedRoute";
import ResponseOutput from "./components/ResponseOutput";
import "./App.css";

export default function App() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);

  return (
    <main>
      <h1>API Test Page</h1>
      <p>React front end. Each button sends a request to the API and shows the response below.</p>
      <HealthCheck onResult={setResult} />
      <AuthForm onResult={setResult} onToken={setToken} />
      <ProtectedRoute token={token} onTokenChange={setToken} onResult={setResult} />
      <ResponseOutput result={result} />
    </main>
  );
}
```

## 11. Step G – styles

Replace `client/src/App.css` with the old page's CSS:

```css
main { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
fieldset { margin-bottom: 1rem; }
input { margin: 0.25rem 0; padding: 0.4rem; width: 100%; box-sizing: border-box; }
button { padding: 0.4rem 1rem; margin-top: 0.25rem; }
pre { background: #f4f4f4; padding: 0.75rem; overflow-x: auto; white-space: pre-wrap; word-break: break-all; }
```

Optionally empty `client/src/index.css` (Vite's default styles center everything and can look odd).

Check `client/src/main.jsx` imports `App` (the template already does):

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## 12. Try it in development

Use two terminals.

```powershell
# Terminal 1 (repo root) – the API
npm start

# Terminal 2 – the React dev server
cd client
npm run dev
```

Open the Vite URL. Click **Check health**, **Register**, **Log in** (token fills in), **Call /me**. Edits to files update the browser instantly.

## 13. Build and serve through Express (replaces `index.html`)

```powershell
cd client
npm run build
```

This writes `index.html` and an `assets/` folder into `public/`. Express already serves `public/` (see `express.static` in [server.js](../server.js)), so `npm start` in the repo root and visiting `http://localhost:3000/` now shows the React app.

Notes:

- `helmet()` adds a Content Security Policy. A Vite build loads only same-origin scripts/styles, so it works. If you later add inline scripts or external CDNs, adjust the helmet config.
- Add `client/node_modules` to `.gitignore` (check the root one covers `node_modules` at any depth; `node_modules/` already does).
- Commit `public/` build output only if you deploy by copying the repo. Otherwise add `public/assets` to `.gitignore` and build in your deploy/CI step (see [github-actions.md](./github-actions.md)).
- Add convenient root scripts to the root `package.json`:

```json
"build:client": "npm --prefix client run build",
"dev:client": "npm --prefix client run dev"
```

## 14. Testing a React app

There are three useful layers. Start with the first two.

| Layer | Tool | Tests | Speed |
|-------|------|-------|-------|
| Unit | **Vitest** | Plain functions such as `call()` | very fast |
| Component | **Vitest + React Testing Library** | A component rendered in a fake browser; click, type, check text | fast |
| End-to-end (E2E) | **Playwright** | The real app in a real browser against the real API | slower |

Vitest is used instead of Jest for the front end because it shares Vite's config and needs no extra transforms. The API keeps using Jest ([testing.md](./testing.md)); the two do not conflict (see step 14.5).

### 14.1 Install (inside `client/`)

```powershell
cd client
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

`jsdom` simulates a browser in Node.

### 14.2 Configure

Add a `test` section to `client/vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  server: { /* ...as before */ },
  build: { /* ...as before */ },
  test: {
    environment: "jsdom",
    globals: true,                 // describe/it/expect without importing
    setupFiles: "./src/setupTests.js",
  },
});
```

Create `client/src/setupTests.js`:

```js
import "@testing-library/jest-dom/vitest";
```

Add scripts to `client/package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

### 14.3 Unit test – `api.js`

Create `client/src/api.test.js`. `vi.stubGlobal` replaces `fetch` with a fake so no server is needed.

```js
import { describe, it, expect, vi, afterEach } from "vitest";
import { call } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("call", () => {
  it("returns status and data on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ status: "UP" }),
    }));

    const result = await call("GET", "/health");

    expect(result).toEqual({ method: "GET", path: "/health", status: 200, data: { status: "UP" } });
  });

  it("sends the bearer token and JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ status: 200, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    await call("POST", "/login", { username: "a" }, "abc");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer abc");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.body).toBe(JSON.stringify({ username: "a" }));
  });

  it("returns an error message when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const result = await call("GET", "/health");

    expect(result.error).toBe("offline");
  });
});
```

### 14.4 Component tests

React Testing Library's rule: test what a user sees and does, not internal state. Find things by their visible text or label.

`client/src/App.test.jsx` – a full login flow with a fake API:

```jsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

afterEach(() => vi.unstubAllGlobals());

function fakeFetch(body, status = 200) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status, json: async () => body }));
}

describe("App", () => {
  it("shows the health response", async () => {
    fakeFetch({ status: "UP" });
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /check health/i }));

    expect(await screen.findByTestId("output")).toHaveTextContent("Status: 200");
    expect(screen.getByTestId("output")).toHaveTextContent('"status": "UP"');
  });

  it("fills in the token after a successful login", async () => {
    fakeFetch({ success: true, data: { token: "jwt-123" } });
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByDisplayValue("jwt-123")).toBeInTheDocument();
  });

  it("shows an error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: /check health/i }));

    expect(await screen.findByText(/request failed: offline/i)).toBeInTheDocument();
  });
});
```

Add small tests per component too (for example render `AuthForm` with `onResult = vi.fn()` and assert it was called after a click).

Run them:

```powershell
cd client
npm test          # one run
npm run test:watch
```

Tips for novices:

- `getByRole` / `getByLabelText` / `getByText` fail immediately if missing; `findBy...` waits (use it after async actions); `queryBy...` returns `null` (use it to assert something is absent).
- Always `await userEvent.click(...)`.
- Mock `fetch` in every test so tests never hit a real server.

### 14.5 Keep root Jest from picking up front-end tests

The root `npm test` runs Jest from the repo root and would find `client/**/*.test.js(x)` and fail. Tell Jest to ignore them. Add to the root `package.json`:

```json
"jest": {
  "testPathIgnorePatterns": ["/node_modules/", "/client/"]
}
```

Add a combined script if desired:

```json
"test:client": "npm --prefix client test"
```

### 14.6 End-to-end tests with Playwright (optional, later)

E2E drives a real browser against the real running API and database, so it proves the whole stack works.

```powershell
cd client
npm init playwright@latest
```

Accept the defaults (JavaScript, `tests` or `e2e` folder). In `playwright.config.js` set the base URL to the built app served by Express and start it automatically:

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  webServer: {
    command: "npm --prefix .. start",
    url: "http://localhost:3000/health",
    reuseExistingServer: true,
  },
});
```

Example `client/e2e/login.spec.js`:

```js
import { test, expect } from "@playwright/test";

test("register, log in and call /me", async ({ page }) => {
  const name = "user" + Date.now();
  await page.goto("/");
  await page.getByLabel("Username").fill(name);
  await page.getByLabel(/password/i).fill("password123");

  await page.getByRole("button", { name: /register/i }).click();
  await expect(page.getByTestId("output")).toContainText("Status: 201");

  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByTestId("output")).toContainText("Status: 200");

  await page.getByRole("button", { name: /call \/me/i }).click();
  await expect(page.getByTestId("output")).toContainText(name);
});
```

Run `npm run build` first (so `public/` has the React app), then `npx playwright test`. Caveats: this needs the API's database configured (see [database.md](./database.md)) and creates real users, so use a test database. The auth rate limiter is bypassed only when `NODE_ENV=test`, so start the server with that set if you run many E2E logins.

### 14.7 Other checks worth adding

- **Lint:** the Vite template includes ESLint; run `npm run lint` in `client/`.
- **Coverage:** `npx vitest run --coverage` (needs `npm i -D @vitest/coverage-v8`).
- **CI:** add a job that runs `npm ci`, `npm test`, and `npm run build` inside `client/`. See [github-actions.md](./github-actions.md).

## 15. Checklist

- [ ] `client/` created with Vite React template
- [ ] Proxy and `build.outDir` set in `vite.config.js`
- [ ] `api.js` and four components written; `App.jsx` assembled
- [ ] Works in dev with both servers running
- [ ] `npm run build` puts the app in `public/`; `http://localhost:3000/` shows it
- [ ] Vitest + Testing Library tests pass (`cd client; npm test`)
- [ ] Root `npm test` still passes (Jest ignores `client/`)
- [ ] (Optional) Playwright E2E and CI job

## 16. Common problems

| Symptom | Cause / fix |
|---------|-------------|
| Dev page loads but buttons return errors | API not running, or path missing from the proxy list in `vite.config.js`. |
| Blank page after build | Open the browser console. Make sure `public/assets` exists and `public/index.html` is the new build. |
| Typing in an input does nothing | Input has `value` but no `onChange`. |
| "act(...)" warnings in tests | Use `await userEvent...` and `findBy...` queries. |
| Root `npm test` fails on `client` files | Add the `testPathIgnorePatterns` in step 14.5. |
| CORS error in dev | Call relative paths (`/login`), not `http://localhost:3000/login`, so the proxy is used. |
