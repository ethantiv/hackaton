# Backend Follow-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the five non-blocking follow-ups raised by the final code review of the backend implementation: (1) close the `argon2id` timing oracle on `/auth/login` for unknown e-mails, (2) add a `photos(job_id)` index, (3) isolate photo storage in tests so they don't litter `backend/data/`, (4) cover `GET /jobs/:id`, (5) cover `GET /jobs/:jobId/photos`.

**Architecture:** All five follow-ups are localized refinements on top of the existing Bun + Hono + SQLite backend. No new modules, no new dependencies. Migrations stay forward-only (a new `002_*.sql` file). Test-only seams are added the same way the existing code uses `setDbForTests` — module-scoped overrides flipped from helpers.

**Tech Stack:** Bun 1.x, Hono, `bun:sqlite`, `argon2`, `bun:test`. No new packages.

**Spec source:** Final-review observations recorded in chat after Task 15 of `docs/superpowers/plans/2026-05-06-backend.md`.

---

## File Map

```
backend/
├── src/
│   ├── auth/
│   │   ├── passwords.ts          # MODIFY — export DUMMY_HASH (precomputed argon2id)
│   │   └── ...
│   ├── routes/
│   │   └── auth.ts               # MODIFY — call verifyPassword unconditionally
│   ├── photos/
│   │   └── storage.ts            # MODIFY — add setPhotosPathForTests + override logic
│   └── db/
│       └── migrations/
│           └── 002_photos_job_index.sql   # NEW
└── tests/
    ├── helpers/
    │   └── testApp.ts            # MODIFY — set per-test temp PHOTOS dir
    ├── passwords.test.ts         # MODIFY — assert DUMMY_HASH shape and behavior
    ├── jobs.test.ts              # MODIFY — append GET /jobs/:id tests
    ├── photos.test.ts            # MODIFY — append GET /jobs/:jobId/photos tests
    └── migrate.test.ts           # MODIFY — assert idx_photos_job exists after migrations
```

---

## Task 1 — Close the `/auth/login` timing oracle for unknown e-mails

**Why:** Today, `auth.ts` skips `argon2.verify` when the user lookup returns `null`. That makes the unknown-email response measurably faster (~100–300 ms) than the wrong-password response, even though both return the same `401 invalid_credentials` body. Run the verifier even when the user is missing so request time no longer leaks account existence.

**Files:**
- Modify: `backend/src/auth/passwords.ts`
- Modify: `backend/src/routes/auth.ts`
- Modify: `backend/tests/passwords.test.ts`

- [ ] **Step 1: Append a `DUMMY_HASH` export and a sanity test**

Append to `backend/tests/passwords.test.ts` (do NOT replace the existing 3 tests):

```ts
import { DUMMY_HASH } from "../src/auth/passwords";

describe("DUMMY_HASH", () => {
  it("is a valid argon2id hash", () => {
    expect(DUMMY_HASH.startsWith("$argon2id$")).toBe(true);
  });

  it("never verifies any password as correct", async () => {
    expect(await verifyPassword(DUMMY_HASH, "test1234")).toBe(false);
    expect(await verifyPassword(DUMMY_HASH, "")).toBe(false);
    expect(await verifyPassword(DUMMY_HASH, "anything")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL (`DUMMY_HASH` is not exported yet)**

```bash
cd backend && bun test tests/passwords.test.ts
```

Expected: failure on `Cannot find name 'DUMMY_HASH'` or import error.

- [ ] **Step 3: Add `DUMMY_HASH` to `passwords.ts`**

Replace the contents of `backend/src/auth/passwords.ts` with:

```ts
import argon2 from "argon2";

const OPTIONS = { type: argon2.argon2id } as const;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// Precomputed argon2id hash of a constant the application will never accept as
// a password. Used to equalize verification time on the unknown-user branch of
// /auth/login so request timing does not reveal whether an e-mail is registered.
export const DUMMY_HASH: string = await hashPassword(
  "__field-notebook-dummy-hash-do-not-use__",
);
```

Note: Bun supports top-level await for ES modules, so the constant is computed once at module load.

- [ ] **Step 4: Run the test, expect 5 passes (3 prior + 2 new)**

```bash
cd backend && bun test tests/passwords.test.ts
```

- [ ] **Step 5: Use `DUMMY_HASH` in the login route**

In `backend/src/routes/auth.ts`, change the import line and the verification block.

Old import:
```ts
import { verifyPassword } from "../auth/passwords";
```

New import:
```ts
import { verifyPassword, DUMMY_HASH } from "../auth/passwords";
```

Old verification (around line 39):
```ts
  const ok = user ? await verifyPassword(user.password_hash, parsed.data.password) : false;
  if (!user || !ok) {
    if (user) recordLoginFailure(db, user.id);
    return c.json({ error: "invalid_credentials" }, 401);
  }
```

New verification:
```ts
  const ok = await verifyPassword(user?.password_hash ?? DUMMY_HASH, parsed.data.password);
  if (!user || !ok) {
    if (user) recordLoginFailure(db, user.id);
    return c.json({ error: "invalid_credentials" }, 401);
  }
```

- [ ] **Step 6: Re-run the entire backend test suite, expect everything green**

```bash
cd backend && bun test
```

Expected: 40 tests pass / 0 fail. (38 prior + 2 new from Step 1.)

- [ ] **Step 7: Confirm typecheck is clean**

```bash
cd backend && bun x tsc --noEmit
```

Expected: no output, exit code 0.

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "Equalize /auth/login timing for unknown e-mails via DUMMY_HASH"
```

---

## Task 2 — Add `idx_photos_job` migration

**Why:** `GET /jobs/:jobId/photos` runs `SELECT * FROM photos WHERE job_id = ?`. Without an index on `photos(job_id)`, that's a full table scan. Add a forward-only migration `002_photos_job_index.sql`. Migration runner already supports versioned files — just drop the new file in.

**Files:**
- Create: `backend/src/db/migrations/002_photos_job_index.sql`
- Modify: `backend/tests/migrate.test.ts`

- [ ] **Step 1: Append a failing test for the new index**

Append to `backend/tests/migrate.test.ts` (keep the existing 2 tests untouched):

```ts
describe("002_photos_job_index", () => {
  it("creates idx_photos_job on photos(job_id)", () => {
    const db = new Database(":memory:");
    runMigrations(db);

    const idx = db
      .query<{ name: string; tbl_name: string }, []>(
        "SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name = 'idx_photos_job'",
      )
      .get();

    expect(idx?.name).toBe("idx_photos_job");
    expect(idx?.tbl_name).toBe("photos");
  });

  it("advances schema_version to at least 2", () => {
    const db = new Database(":memory:");
    const v = runMigrations(db);
    expect(v).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run the test, expect FAIL (no migration file yet)**

```bash
cd backend && bun test tests/migrate.test.ts
```

Expected: 2 prior tests pass; the 2 new ones fail because no `002_*.sql` exists.

- [ ] **Step 3: Create `backend/src/db/migrations/002_photos_job_index.sql`**

```sql
CREATE INDEX IF NOT EXISTS idx_photos_job ON photos(job_id);
```

- [ ] **Step 4: Re-run, expect all 4 migration tests pass**

```bash
cd backend && bun test tests/migrate.test.ts
```

- [ ] **Step 5: Run the entire backend test suite, expect no regressions**

```bash
cd backend && bun test
```

Expected: 42 pass / 0 fail. (40 from Task 1 + 2 new here.)

- [ ] **Step 6: Confirm typecheck is clean**

```bash
cd backend && bun x tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "Add migration 002 with idx_photos_job index"
```

---

## Task 3 — Isolate photo storage in tests with a per-suite temp directory

**Why:** Today, `backend/src/photos/storage.ts` reads `config.PHOTOS_PATH` directly. Tests that exercise upload write real bytes under `backend/data/photos/...`. Those files are gitignored but they accumulate across test runs and confuse local inspection. Mirror the `setDbForTests` seam: add a module-scoped override and flip it from `tests/helpers/testApp.ts` to a fresh `mkdtempSync` directory per `buildApp()` call.

**Files:**
- Modify: `backend/src/photos/storage.ts`
- Modify: `backend/tests/helpers/testApp.ts`

- [ ] **Step 1: Add a test-only override to `storage.ts`**

Replace the entire contents of `backend/src/photos/storage.ts` with:

```ts
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { config } from "../config";

let _basePathOverride: string | null = null;

export function setPhotosPathForTests(path: string | null): void {
  _basePathOverride = path;
}

function basePath(): string {
  return _basePathOverride ?? config.PHOTOS_PATH;
}

export function writePhoto(
  userId: string,
  jobId: string,
  photoId: string,
  ext: string,
  bytes: Uint8Array,
): string {
  const dir = join(basePath(), userId, jobId);
  mkdirSync(dir, { recursive: true });
  const filename = `${photoId}.${ext}`;
  writeFileSync(join(dir, filename), bytes);
  return join(userId, jobId, filename);
}

export function readPhoto(relPath: string): Uint8Array | null {
  const abs = join(basePath(), relPath);
  if (!existsSync(abs)) return null;
  return readFileSync(abs);
}
```

- [ ] **Step 2: Wire the override into the test helper**

Replace the entire contents of `backend/tests/helpers/testApp.ts` with:

```ts
import { Hono } from "hono";
import { Database } from "bun:sqlite";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runMigrations } from "../../src/db/migrate";
import { setDbForTests } from "../../src/db/client";
import { seed } from "../../src/db/seed";
import { setPhotosPathForTests } from "../../src/photos/storage";
import { health } from "../../src/routes/health";
import { auth } from "../../src/routes/auth";
import { me } from "../../src/routes/me";
import { jobs } from "../../src/routes/jobs";
import { jobPhotos, photoFiles } from "../../src/routes/photos";
import { secureHeaders } from "../../src/middleware/secureHeaders";
import { loginRateLimit } from "../../src/middleware/rateLimit";
import { errorHandler } from "../../src/middleware/errorHandler";

export async function buildApp() {
  const db = new Database(":memory:");
  runMigrations(db);
  setDbForTests(db);
  await seed(db);

  const photosPath = mkdtempSync(join(tmpdir(), "field-notebook-photos-"));
  setPhotosPathForTests(photosPath);

  const app = new Hono();
  app.use("*", secureHeaders());
  app.onError(errorHandler);
  app.use("/auth/login", loginRateLimit({ max: 10, windowMs: 15 * 60_000 }));
  app.route("/health", health);
  app.route("/auth", auth);
  app.route("/me", me);
  app.route("/jobs", jobs);
  app.route("/jobs", jobPhotos);
  app.route("/photos", photoFiles);
  return { app, db, photosPath };
}
```

- [ ] **Step 3: Run the entire backend test suite, expect everything green**

```bash
cd backend && bun test
```

Expected: 42 pass / 0 fail. The existing photo tests should now write into `/tmp/field-notebook-photos-*` directories instead of `backend/data/photos/`.

- [ ] **Step 4: Confirm `backend/data/photos/` is no longer touched by tests**

```bash
rm -rf backend/data/photos
cd backend && bun test
ls backend/data 2>/dev/null
```

Expected: after the test run, `backend/data` either does not exist or contains no `photos/` subdirectory created by the test suite. (`bun run migrate` and `bun run seed` would create `backend/data/app.db`, but the test suite uses `:memory:` for the DB, so nothing should land in `backend/data/`.)

- [ ] **Step 5: Confirm typecheck is clean**

```bash
cd backend && bun x tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "Isolate photo storage in tests with per-suite temp directory"
```

---

## Task 4 — Cover `GET /jobs/:id`

**Why:** The endpoint has been live since Task 11 of the original plan, but no integration test asserts its three branches: own job (200), other technician's job (404), unknown id (404). Append a dedicated `describe` block to `tests/jobs.test.ts`.

**Files:**
- Modify: `backend/tests/jobs.test.ts`

- [ ] **Step 1: Append the new `describe` block**

Append to the END of `backend/tests/jobs.test.ts` (after the existing `POST /jobs/:id/complete` block). Keep the existing `loginAs` helper and imports — they're already declared at the top of the file.

```ts
describe("GET /jobs/:id", () => {
  it("returns a job owned by the technician", async () => {
    const { app, db } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const own = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) LIMIT 1",
      )
      .get("marek@firma.pl")!;

    const res = await app.request(`/jobs/${own.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; status: string };
    expect(body.id).toBe(own.id);
    expect(["pending", "in_progress", "done"]).toContain(body.status);
  });

  it("returns 404 for another technician's job", async () => {
    const { app, db } = await buildApp();
    const annaJob = db
      .query<{ id: string }, [string]>(
        "SELECT id FROM jobs WHERE technician_id = (SELECT id FROM users WHERE email = ?) LIMIT 1",
      )
      .get("anna@firma.pl")!;
    const token = await loginAs(app, "marek@firma.pl");

    const res = await app.request(`/jobs/${annaJob.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 for an unknown id", async () => {
    const { app } = await buildApp();
    const token = await loginAs(app, "marek@firma.pl");
    const res = await app.request(`/jobs/does-not-exist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });
});
```

- [ ] **Step 2: Run the suite, expect 3 new passes**

```bash
cd backend && bun test tests/jobs.test.ts
```

Expected: 6 prior + 3 new = 9 tests in the file, all green.

- [ ] **Step 3: Run the entire backend test suite**

```bash
cd backend && bun test
```

Expected: 45 pass / 0 fail. (42 from Task 3 + 3 new here.)

- [ ] **Step 4: Confirm typecheck is clean**

```bash
cd backend && bun x tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "Cover GET /jobs/:id with own/foreign/unknown-id tests"
```

---

## Task 5 — Cover `GET /jobs/:jobId/photos`

**Why:** Same story as Task 4 — endpoint exists since Task 12 but has no integration test. Add tests for the empty list, the populated list (after one upload), and the cross-user 404 branch.

**Files:**
- Modify: `backend/tests/photos.test.ts`

- [ ] **Step 1: Append the new `describe` block**

Append to the END of `backend/tests/photos.test.ts`. Keep the existing `JPEG_MAGIC`, `loginAs`, `getOwnJobId` helpers and imports — they're already declared at the top.

```ts
describe("GET /jobs/:jobId/photos", () => {
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
```

- [ ] **Step 2: Run the suite, expect 3 new passes**

```bash
cd backend && bun test tests/photos.test.ts
```

Expected: 3 prior + 3 new = 6 tests in the file, all green.

- [ ] **Step 3: Run the entire backend test suite**

```bash
cd backend && bun test
```

Expected: 48 pass / 0 fail. (45 from Task 4 + 3 new here.)

- [ ] **Step 4: Confirm typecheck is clean**

```bash
cd backend && bun x tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "Cover GET /jobs/:jobId/photos with empty, populated, and 404 tests"
```

---

## Self-review

- [ ] Run the full suite once more from a clean checkout (`cd backend && bun test`) and confirm 48 pass / 0 fail.
- [ ] Run `cd backend && bun x tsc --noEmit` and confirm exit 0.
- [ ] Confirm each follow-up has a task:
  - timing oracle on `/auth/login` → Task 1
  - `idx_photos_job` index → Task 2
  - photo storage in tests writing into `backend/data/` → Task 3
  - missing test coverage for `GET /jobs/:id` → Task 4
  - missing test coverage for `GET /jobs/:jobId/photos` → Task 5
- [ ] Confirm `backend/data/photos/` is empty after a test run.
