import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { app } from "../../src/app/index.js";
import * as userQueries from "../../src/db/queries/users.js";
import * as authModule from "../../src/auth.js";

vi.mock("../../src/db/queries/users.js", () => ({
  createUser: vi.fn(),
  getUsers: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("../../src/auth.js", () => ({
  hashPassword: vi.fn(),
}));

describe("users routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /users should create a user", async () => {
    (authModule.hashPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      "hashed-password",
    );

    (userQueries.createUser as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      {
        id: "user1",
        email: "sue@example.com",
        password: "hashed-password",
      },
    ]);

    const res = await request(app).post("/users").send({
      email: "sue@example.com",
      password: "12345678",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("sue@example.com");
  });

  it("POST /users should return 400 if email or password missing", async () => {
    const res = await request(app).post("/users").send({
      email: "sue@example.com",
    });

    expect(res.status).toBe(400);
  });

  it("GET /users should return all users", async () => {
    (userQueries.getUsers as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: "1", email: "a@test.com" },
      { id: "2", email: "b@test.com" },
    ]);

    const res = await request(app).get("/users");

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveLength(2);
  });

  it("GET /users/:id should return one user", async () => {
    (userQueries.getUserById as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      [{ id: "1", email: "sue@example.com" }],
    );

    const res = await request(app).get("/users/1");

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("sue@example.com");
  });
});