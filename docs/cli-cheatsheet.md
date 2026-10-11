# Command-Line Cheatsheet

Run these in a terminal opened in the project root. In VS Code: Terminal, New Terminal.

## npm (Node Package Manager)

npm installs libraries and runs the project's scripts, which are defined in the `scripts` section of [package.json](../package.json).

| Command | What it does |
| :--- | :--- |
| `npm install` | Installs everything listed in `package.json` into `node_modules/`. Run after cloning or pulling new dependencies. |
| `npm ci` | Clean install of exactly what `package-lock.json` says. Used in CI; fails if the lock file is out of sync. |
| `npm install <pkg>` | Adds a library to `dependencies` (needed to run the app), e.g. `npm install cors`. |
| `npm install -D <pkg>` | Adds a dev-only tool (testing, linting), e.g. `npm install -D eslint`. |
| `npm uninstall <pkg>` | Removes a library. |
| `npm start` | Runs the `start` script: starts the server (`node server.js`). |
| `npm test` | Runs the `test` script: runs Jest. |
| `npm run <name>` | Runs any other script, e.g. `npm run lint` once you add it. |
| `npm run` | Lists all available scripts. |
| `npm outdated` | Shows libraries with newer versions. |
| `npm audit` | Checks dependencies for known security problems. |
| `npm ls <pkg>` | Shows which version of a library is installed. |

`start` and `test` are special, so you can skip the word `run`. Other scripts need `npm run`.

## npx (run a tool without installing it globally)

`npx` runs a command from `node_modules/.bin` (a project-local tool) or downloads and runs a package temporarily.

| Command | What it does |
| :--- | :--- |
| `npx jest` | Runs Jest directly, so you can pass options (below). |
| `npx jest --watch` | Re-runs tests when files change. |
| `npx jest --coverage` | Reports which lines the tests exercise. |
| `npx jest tests/token.test.js` | Runs a single test file. |
| `npx jest -t "login"` | Runs only tests whose name contains "login". |
| `npx eslint .` / `npx prettier --check .` | Lint or format-check (after setting them up). |
| `npm init playwright@latest` | Scaffolds Playwright (npm's `init` also runs a package). |
| `npm create vite@latest client` | Scaffolds a Vue/React front end. |

Rule of thumb: `npm` manages packages and scripts, `npx` runs a tool once.

## Running the app

| Command | What it does |
| :--- | :--- |
| `npm start` | Starts the server on your `PORT` (see `.env`). Stop it with **Ctrl+C**. |
| `node server.js` | Same thing without npm. |
| `node --watch server.js` | Restarts automatically when you save a file (Node 18.11+). Handy during development. |
| `node --version`, `npm --version` | Check your installed versions. |

If you see `EADDRINUSE`, something is already using that port. Find it:
- Windows PowerShell: `Get-NetTCPConnection -LocalPort 8000`
- macOS/Linux: `lsof -i :8000`

## Generating a secret (for JWT_SECRET)

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`node -e "..."` runs a one-line script. See [configuration.md](configuration.md).

## curl

See [using-curl.md](using-curl.md). Quick check: `curl http://localhost:8000/health` (PowerShell: `curl.exe`).

## git

| Command | What it does |
| :--- | :--- |
| `git status` | Shows changed and untracked files. Check this before committing (`.env` must NOT appear). |
| `git diff` | Shows unstaged changes line by line. |
| `git add <file>` / `git add .` | Stages files for the next commit. |
| `git commit -m "message"` | Saves staged changes as a commit. |
| `git push` | Uploads commits to GitHub. |
| `git pull` | Downloads and merges new commits. |
| `git log --oneline` | Compact history. |
| `git checkout -b <branch>` | Creates and switches to a new branch (good for trying things). |
| `git restore <file>` | Discards uncommitted changes to a file. |
| `git grep "text"` | Searches tracked files. |

Tip: GitHub blocks pushes that contain secrets. Keep them in `.env` only.

## Docker (optional, for local PostgreSQL)

See [database.md](database.md).

| Command | What it does |
| :--- | :--- |
| `docker ps` | Lists running containers. |
| `docker stop dev-pg` / `docker start dev-pg` | Stops or starts the database container. |
| `docker logs dev-pg` | Shows its output (useful when it won't start). |
| `docker rm -f dev-pg` | Deletes the container (and its data, unless you used a volume). |

## Handy terminal tips

- **Ctrl+C** stops a running command; **Up arrow** recalls the previous command; **Tab** auto-completes file names.
- PowerShell differs from bash: use `curl.exe`, a backtick `` ` `` for line continuation, and `$env:NAME` for environment variables.
- Prefer installing tools per project (`npm install -D`) over globally (`npm install -g`), so everyone uses the same versions.
