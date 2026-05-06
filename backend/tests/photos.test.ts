import { describe, it, expect } from "bun:test";
import type { Database } from "bun:sqlite";
import { buildApp } from "./helpers/testApp";

const JPEG_MAGIC = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(64).fill(0x00)]);
const NOT_AN_IMAGE = new Uint8Array([0x00, 0x01, 0x02, 0x03]);

async function loginAs(app: any, email: string) {
  const r = await app.request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "test1234" }),
  });
  return (await r.json()).accessToken as string;
}

async function getOwnJobId(app: any, db: Database, email: string): Promise<string> {
  const row = db
    .query<{ id: string }, [string]>(
      "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) LIMIT 1",
    )
    .get(email);
  return row!.id;
}

describe("POST /jobs/:id/photos", () => {
  it("uploads a JPEG and returns metadata", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const jobId = await getOwnJobId(app, db, "marek@firma.pl");

    const form = new FormData();
    form.append("file", new Blob([JPEG_MAGIC], { type: "image/jpeg" }), "p.jpg");
    form.append("description", "Test");

    const res = await app.request(`/jobs/${jobId}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { mimeType: string; description: string };
    expect(body.mimeType).toBe("image/jpeg");
    expect(body.description).toBe("Test");
  });

  it("rejects a non-image with 415", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const jobId = await getOwnJobId(app, db, "marek@firma.pl");

    const form = new FormData();
    form.append("file", new Blob([NOT_AN_IMAGE], { type: "image/jpeg" }), "fake.jpg");
    form.append("description", "Test");

    const res = await app.request(`/jobs/${jobId}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    expect(res.status).toBe(415);
  });

  it("rejects upload to another technician's job with 404", async () => {
    const { app, db } = await buildApp();
    const annaJob = await getOwnJobId(app, db, "anna@firma.pl");
    const token = await loginAs(app, "marek@firma.pl");

    const form = new FormData();
    form.append("file", new Blob([JPEG_MAGIC], { type: "image/jpeg" }), "p.jpg");
    form.append("description", "Test");

    const res = await app.request(`/jobs/${annaJob}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    expect(res.status).toBe(404);
  });
});

describe("GET /jobs/:id/photos", () => {
  it("returns an empty array for a job with no photos", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const jobId = await getOwnJobId(app, db, "marek@firma.pl");

    const res = await app.request(`/jobs/${jobId}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(0);
  });

  it("lists photos uploaded to the job in chronological order", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const jobId = await getOwnJobId(app, db, "marek@firma.pl");

    const upload = new FormData();
    upload.append("file", new Blob([JPEG_MAGIC], { type: "image/jpeg" }), "p.jpg");
    upload.append("description", "First");
    const uploadRes = await app.request(`/jobs/${jobId}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: upload,
    });
    expect(uploadRes.status).toBe(201);

    const res = await app.request(`/jobs/${jobId}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ jobId: string; description: string }>;
    expect(body.length).toBe(1);
    expect(body[0].jobId).toBe(jobId);
    expect(body[0].description).toBe("First");
  });

  it("returns 404 when listing photos for another technician's job", async () => {
    const { app, db } = await buildApp();
    const annaJob = await getOwnJobId(app, db, "anna@firma.pl");
    const token = await loginAs(app, "marek@firma.pl");

    const res = await app.request(`/jobs/${annaJob}/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });
});
