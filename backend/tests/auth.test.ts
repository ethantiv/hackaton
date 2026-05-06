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

describe("POST /auth/refresh", () => {
  it("rotates: new pair issued, old refresh revoked", async () => {
    const { app } = await buildApp();
    const login = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "marek@firma.pl", password: "test1234" }),
    });
    const { refreshToken } = await login.json();

    const r1 = await app.request("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(r1.status).toBe(200);
    const out = await r1.json();
    expect(out.accessToken.length).toBeGreaterThan(0);
    expect(out.refreshToken).not.toBe(refreshToken);

    // Reusing the old refresh token must fail
    const r2 = await app.request("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(r2.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("204s and revokes the refresh token", async () => {
    const { app } = await buildApp();
    const login = await app.request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "marek@firma.pl", password: "test1234" }),
    });
    const { accessToken, refreshToken } = await login.json();

    const out = await app.request("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
    expect(out.status).toBe(204);

    const refresh = await app.request("/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    expect(refresh.status).toBe(401);
  });
});
