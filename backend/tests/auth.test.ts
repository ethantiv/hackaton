import { describe, it, expect } from "bun:test";
import { buildApp } from "./helpers/testApp";

async function login(app: any, body: object) {
  return app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /auth/login", () => {
  it("returns access + refresh tokens on valid credentials", async () => {
    const { app } = await buildApp();
    const res = await login(app, { email: "marek@firma.pl", password: "test1234" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.accessToken).toBe("string");
    expect(typeof body.refreshToken).toBe("string");
    expect(body.user.email).toBe("marek@firma.pl");
    expect(body.user.passwordHash).toBeUndefined();
  });

  it("rejects wrong password with 401 and a generic message", async () => {
    const { app } = await buildApp();
    const res = await login(app, { email: "marek@firma.pl", password: "wrong" });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("invalid_credentials");
  });

  it("returns the SAME response shape for unknown email (no enumeration)", async () => {
    const { app } = await buildApp();
    const res = await login(app, { email: "ghost@firma.pl", password: "anything" });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("invalid_credentials");
  });

  it("locks the account after 5 failed attempts (returns 423)", async () => {
    const { app } = await buildApp();
    for (let i = 0; i < 5; i++) {
      await login(app, { email: "marek@firma.pl", password: "wrong" });
    }
    const res = await login(app, { email: "marek@firma.pl", password: "test1234" });
    expect(res.status).toBe(423);
    const body = await res.json();
    expect(body.error).toBe("account_locked");
    expect(typeof body.lockedUntil).toBe("number");
  });
});
