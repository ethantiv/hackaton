import { describe, it, expect } from "bun:test";
import { buildApp } from "./helpers/testApp";

describe("GET /health", () => {
  it("returns 200 with { ok: true }", async () => {
    const { app } = await buildApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
