# Testing Guide

## Run the tests

```bash
npm test                 # run everything once
npx jest --watch         # re-run automatically when files change
npx jest --coverage      # show which lines the tests exercise
```

## What is set up

| File | Type | What it checks |
| :--- | :--- | :--- |
| [tests/token.test.js](../tests/token.test.js) | Unit | JWT creation, verification, tamper detection, and the `JWT_EXPIRES_IN` setting. |
| [tests/auth-handler.test.js](../tests/auth-handler.test.js) | Unit | Password hashing, duplicate usernames, login errors. |
| [tests/api.test.js](../tests/api.test.js) | Integration | Real HTTP requests to every endpoint (using supertest) and the HTML page. |

- **Unit test**: runs one small function in isolation. Fast and pinpoints bugs.
- **Integration test**: runs several parts together (route, logic, storage), like a real request.

Tests set their own `JWT_SECRET`, so they don't depend on your `.env`.

## Tools for JavaScript testing

| Tool | Use it for | Status |
| :--- | :--- | :--- |
| **Jest** | Unit and integration tests for Node code. Test runner plus assertions plus mocking. | In use |
| **supertest** | Sending HTTP requests to the Express app inside tests. | In use |
| **Vitest** | A Jest-compatible runner that is faster, and the natural choice if you add Vite, Vue, or React. | Option |
| **Testing Library** (`@testing-library/dom`, `/react`, `/vue`) | Testing UI components the way a user sees them. | Add with a front-end framework |
| **Playwright** | End-to-end tests: drives a real browser and clicks through the HTML page or a future GUI. | Good next step |
| **Cypress** | Alternative to Playwright, with a friendly visual runner. | Option |
| **Postman / Newman, Insomnia** | Manual or scripted API checks outside the code. | Option |

## Testing the HTML page

Today the page is covered two ways: an integration test checks that it is served, and you can click through it manually at `http://localhost:8000/`. To automate the clicking, add Playwright (`npm init playwright@latest`) and write a test that opens the page, registers, logs in, and checks the response box.

## Tips

- Name files `something.test.js` in `tests/`; Jest finds them automatically.
- Test behavior (what goes in, what comes out), not implementation details.
- When you fix a bug, add a test that would have caught it.
- Tests that touch PostgreSQL later should use a separate test database so real data is never changed.
