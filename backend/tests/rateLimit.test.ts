import { describe, it, expect } from "bun:test";
import { buildApp } from "./helpers/testApp";

describe("login rate limit", () => {
  it("returns 429 after the 11th attempt from the same IP", async () => {
    const { app } = await buildApp();
    const headers = { "Content-Type": "application/json", "X-Forwarded-For": "1.2.3.4" };
    const body = JSON.stringify({ email: "ghost@firma.pl", password: "x" });
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const r = await app.request("/auth/login", { method: "POST", headers, body });
      last = r.status;
    }
    expect(last).toBe(429);
  });
});
