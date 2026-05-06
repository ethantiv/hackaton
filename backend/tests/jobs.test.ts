import { describe, it, expect } from "bun:test";
import { buildApp } from "./helpers/testApp";

async function loginAs(app: any, email: string) {
  const r = await app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "test1234" }),
  });
  const body = await r.json();
  return body.accessToken as string;
}

describe("GET /jobs", () => {
  it("returns only the logged-in technician's jobs", async () => {
    const { app } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const res = await app.request("/jobs", { headers: { Authorization: `Bearer ${token}` } });
    expect(res.status).toBe(200);
    const jobs = (await res.json()) as Array<{ id: string }>;
    expect(jobs.length).toBe(8);
    expect(new Set(jobs.map((j: any) => j.id)).size).toBe(8);
  });

  it("isolates users — Anna does not see Marek's jobs", async () => {
    const { app } = await buildApp();
    const t1 = await loginAs(app, "anna@firma.pl");
    const r1 = await app.request("/jobs", { headers: { Authorization: `Bearer ${t1}` } });
    const annaJobs = (await r1.json()) as Array<{ id: string }>;
    const t2 = await loginAs(app, "marek@firma.pl");
    const r2 = await app.request("/jobs", { headers: { Authorization: `Bearer ${t2}` } });
    const marekJobs = (await r2.json()) as Array<{ id: string }>;
    const annaIds = new Set(annaJobs.map((j: any) => j.id));
    expect(marekJobs.every((j: any) => !annaIds.has(j.id))).toBe(true);
  });
});

describe("POST /jobs/:id/start", () => {
  it("transitions a pending job into in_progress and returns it", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const pending = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) AND status = 'pending' LIMIT 1",
      )
      .get("marek@firma.pl")!;

    const res = await app.request(`/jobs/${pending.id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("in_progress");
  });

  it("rejects starting another technician's job with 404", async () => {
    const { app, db } = await buildApp();
    const annaJob = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) LIMIT 1",
      )
      .get("anna@firma.pl")!;
    const token = await loginAs(app, "marek@firma.pl");
    const res = await app.request(`/jobs/${annaJob.id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("rejects starting a done job with 409", async () => {
    const { app, db } = await buildApp();
    const done = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) AND status = 'done' LIMIT 1",
      )
      .get("marek@firma.pl")!;
    const token = await loginAs(app, "marek@firma.pl");
    const res = await app.request(`/jobs/${done.id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(409);
  });
});

describe("POST /jobs/:id/complete", () => {
  it("transitions in_progress -> done", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const pending = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) AND status = 'pending' LIMIT 1",
      )
      .get("marek@firma.pl")!;
    await app.request(`/jobs/${pending.id}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await app.request(`/jobs/${pending.id}/complete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    expect(((await res.json()) as { status: string }).status).toBe("done");
  });
});
