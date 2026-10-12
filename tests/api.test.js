process.env.JWT_SECRET = "test-secret";
const request = require("supertest");
const app = require("../server");
const users = require("../src/db/users");

beforeEach(() => users.clear());

const creds = { username: "alice", password: "password123" };

describe("API", () => {
  test("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
  });

  test("serves the HTML test page", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("API Test Page");
  });

  test("register, login, and access protected route", async () => {
    expect((await request(app).post("/register").send(creds)).status).toBe(201);
    const login = await request(app).post("/login").send(creds);
    expect(login.status).toBe(200);
    const me = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${login.body.data.token}`);
    expect(me.body.username).toBe("alice");
  });

  test("rejects duplicate registration", async () => {
    await request(app).post("/register").send(creds);
    expect((await request(app).post("/register").send(creds)).status).toBe(409);
  });

  test("rejects short password and missing fields", async () => {
    expect(
      (
        await request(app)
          .post("/register")
          .send({ username: "a", password: "x" })
      ).status,
    ).toBe(400);
    expect((await request(app).post("/register").send({})).status).toBe(400);
  });

  test("rejects wrong password and unauthenticated /me", async () => {
    await request(app).post("/register").send(creds);
    expect(
      (
        await request(app)
          .post("/login")
          .send({ ...creds, password: "wrongpass1" })
      ).status,
    ).toBe(401);
    expect((await request(app).get("/me")).status).toBe(401);
  });

  test("allows a configured CORS origin", async () => {
    const res = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173",
    );
  });
});
