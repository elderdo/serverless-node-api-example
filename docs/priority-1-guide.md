# Priority 1 Setup Guide

Step-by-step instructions for the six easy to-dos in [todo.md](todo.md). Each section stands alone, so do them in any order. After each one, run `npm test` to make sure nothing broke, and commit.

Commands are for a terminal in the project root. The code snippets edit [server.js](../server.js) unless noted.

---

## 1. Add CORS

**What and why:** Browsers block a web page from calling an API on a different address (origin). If a Vue/React app runs at `http://localhost:5173` and this API at `http://localhost:8000`, the browser refuses the call unless the API says it is allowed. That permission system is CORS. (The HTML test page in `public/` is served by the API itself, so it doesn't need CORS.)

**Steps**
1. Install:
   ```bash
   npm install cors
   ```
2. In `server.js`, add near the other `require` lines:
   ```js
   const cors = require("cors");
   ```
3. Add it BEFORE your routes, right above `app.use(express.json());`:
   ```js
   // Only these origins may call the API from a browser. Add your front end's address.
   app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
   ```
   Don't use `cors()` with no options in production: that allows every website.
4. Optional: put the list in `.env` (for example `CORS_ORIGINS=http://localhost:5173`), read it with `process.env.CORS_ORIGINS.split(",")`, and document it in `.env.example`.

**Verify**
```bash
curl -i -H "Origin: http://localhost:5173" http://localhost:8000/health
```
The response headers should include `Access-Control-Allow-Origin: http://localhost:5173`. Repeat with `-H "Origin: http://evil.example"` and that header should be absent.

**Add a test** (in `tests/api.test.js`, inside `describe`):
```js
test('allows a configured CORS origin', async () => {
    const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
});
```

---

## 2. Add security headers (helmet)

**What and why:** `helmet` sets a bundle of HTTP response headers that switch on browser protections (against clickjacking, content sniffing, and so on). It is one line and a standard Express practice.

**Steps**
1. Install:
   ```bash
   npm install helmet
   ```
2. In `server.js`:
   ```js
   const helmet = require("helmet");
   ```
   and add it as the FIRST `app.use`, before CORS and the routes:
   ```js
   app.use(helmet());
   ```

**Gotcha:** helmet's default Content-Security-Policy blocks inline scripts. The test page [public/index.html](../public/index.html) uses an inline `<script>`, so it will stop working. Fix it one of two ways:
- Move the script into `public/app.js` and load it with `<script src="app.js"></script>` (recommended; also tidier), or
- Relax the policy: `helmet({ contentSecurityPolicy: false })` (simpler, less safe).

**Verify**
```bash
curl -i http://localhost:8000/health
```
You should see headers such as `X-Content-Type-Options: nosniff` and `Content-Security-Policy`. Open `http://localhost:8000/` in the browser and confirm the buttons still work.

---

## 3. Rate-limit /login and /register

**What and why:** Without limits, a script can try thousands of passwords per minute. Rate limiting caps requests per client address.

**Steps**
1. Install:
   ```bash
   npm install express-rate-limit
   ```
2. In `server.js`:
   ```js
   const rateLimit = require("express-rate-limit");

   // Max 10 attempts per 15 minutes per IP on the auth routes.
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     limit: 10,
     standardHeaders: true,
     legacyHeaders: false,
     message: { error: "Too many attempts, please try again later" },
   });
   ```
3. Attach it to the two routes only (not `/health`), putting it before the other handlers:
   ```js
   app.post("/register", authLimiter, validateCredentials, async (req, res) => { ... });
   app.post("/login", authLimiter, validateCredentials, async (req, res) => { ... });
   ```

**Gotchas**
- **Tests:** the existing tests make several requests from one address and could trip the limit. Easiest fix: skip limiting in tests with `skip: () => process.env.NODE_ENV === "test"` in the options (Jest sets `NODE_ENV=test` automatically).
- **Behind a proxy or Lambda/API Gateway:** all users can look like one IP. You'll need `app.set("trust proxy", 1)` when you deploy.
- The counter lives in memory, so it resets on restart and isn't shared across multiple servers. Fine for now.

**Verify:** run the login request 11 times quickly (a PowerShell loop is fine); the 11th should return HTTP 429.

---

## 4. GitHub Actions workflow that runs the tests

**What and why:** Continuous Integration (CI) runs your tests on GitHub automatically for every push and pull request, so breakage is caught early.

**Steps**
1. Create the folder and file `.github/workflows/test.yml`:
   ```yaml
   name: Tests

   on:
     push:
       branches: [main]
     pull_request:

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: npm
         - run: npm ci
         - run: npm test
   ```
2. Commit and push. Open the repository's **Actions** tab to watch it run. A green check means pass.

**Notes**
- `npm ci` installs exactly what `package-lock.json` says, so keep that file committed.
- The tests set their own `JWT_SECRET`, so no secrets are needed in CI. When you later need real secrets, store them in **Settings, Secrets and variables, Actions**, never in the YAML.
- Optional: add a badge to the README: `![Tests](https://github.com/elderdo/serverless-node-api-example/actions/workflows/test.yml/badge.svg)`

---

## 5. Clean up the old benchmark files

**What and why:** [.github/workflows/benchmark.yml](../.github/workflows/benchmark.yml) and [scripts/run_benchmark.py](../scripts/run_benchmark.py) were built for the earlier secrets-scanner benchmark. That code no longer exists here (and the workflow only runs manually), so they are leftover clutter. The workflow also clones a different repository (`crenoxhq/serverless-node-api-boilerplate`) rather than this one.

**Decide first:** do you still want the scanner benchmark?
- **No (most likely):** delete both files.
- **Yes:** move them to a separate repository, since benchmarks need intentionally fake secrets that GitHub push protection will keep blocking.

**Steps to delete**
```bash
git rm .github/workflows/benchmark.yml scripts/run_benchmark.py
git commit -m "chore: remove old secrets-scanner benchmark"
```
If `scripts/` is now empty, git drops it automatically. Also check that nothing else references them: `git grep -i benchmark`.

---

## 6. Add ESLint and Prettier

**What and why:** ESLint finds likely bugs (unused variables, undefined names). Prettier formats code consistently so you never argue about spacing. They do different jobs and work well together.

**Steps**
1. Install:
   ```bash
   npm install -D eslint @eslint/js globals prettier eslint-config-prettier
   ```
2. Create `eslint.config.js` in the project root:
   ```js
   const js = require("@eslint/js");
   const globals = require("globals");
   const prettier = require("eslint-config-prettier");

   module.exports = [
     js.configs.recommended,
     {
       languageOptions: {
         sourceType: "commonjs",
         globals: { ...globals.node },
       },
     },
     { files: ["tests/**/*.js"], languageOptions: { globals: { ...globals.jest } } },
     { files: ["public/**/*.js"], languageOptions: { sourceType: "script", globals: { ...globals.browser } } },
     { ignores: ["node_modules/"] },
     prettier, // keep last: turns off rules that conflict with Prettier
   ];
   ```
3. Create `.prettierrc`:
   ```json
   { "singleQuote": false, "semi": true, "printWidth": 100 }
   ```
   and `.prettierignore`:
   ```
   node_modules
   package-lock.json
   ```
4. Add scripts to `package.json`:
   ```json
   "lint": "eslint .",
   "format": "prettier --write ."
   ```
5. Run them:
   ```bash
   npm run format   # rewrites files into one style
   npm run lint     # reports problems
   ```

**Notes**
- Run `format` once and commit that on its own, so the big whitespace diff is separate from real changes.
- The existing code mixes single and double quotes; Prettier will normalize them.
- Possible lint complaints: an unused `err` in a `catch` block in [requireAuth.js](../src/middleware/requireAuth.js). Use `catch {` or `catch (_err)`, or just remove the variable.
- In VS Code, install the **ESLint** and **Prettier** extensions and enable "Format on Save".
- Optional: add `- run: npm run lint` to the CI workflow from section 4.

---

## Done checklist
- [ ] CORS works for an allowed origin, blocked for others
- [ ] helmet headers present and the test page still works
- [ ] 11th rapid login returns 429
- [ ] GitHub Actions shows a green check
- [ ] Old benchmark files removed
- [ ] `npm run lint` passes and code is formatted

Then tick these off in [todo.md](todo.md).
