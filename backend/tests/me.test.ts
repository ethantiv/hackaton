import { describe, it, expect } from "bun:test";
import { buildApp } from "./helpers/testApp";

async function loginToken(app: any) {
  const r = await app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "marek@firma.pl", password: "test1234" }),
  });
  return (await r.json()).accessToken as string;
}

describe("GET /me", () => {
  it("returns the logged-in user's profile", async () => {
    const { app } = await buildApp();
    const token = await loginToken(app);
    const res = await app.request("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { email: string; displayName: string; specialization: string };
    expect(body.email).toBe("marek@firma.pl");
    expect(body.displayName).toBe("Marek Kowalski");
    expect(body.specialization).toBe("elektryk");
  });

  it("rejects missing Authorization", async () => {
    const { app } = await buildApp();
    const res = await app.request("/me");
    expect(res.status).toBe(401);
  });
});
